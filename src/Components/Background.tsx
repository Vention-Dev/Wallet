import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "../State/store";
import { setLatestOperation, setSourceHistory } from "../State/Slices/HistorySlice";
import { getNostrClient } from "../Api";
import * as Types from '../Api/autogenerated/ts/types'
import { addNotification } from "../State/Slices/notificationSlice";
import { notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";
import { NOSTR_PRIVATE_KEY_STORAGE_KEY, getFormattedTime } from "../constants";
import { useIonRouter } from "@ionic/react";
import { Modal } from "./Modals/Modal";
import { UseModal } from "../Hooks/UseModal";
import { isBrowser, isWindows } from "react-device-detect";
import * as icons from '../Assets/SvgIconLibrary';
import { Clipboard } from '@capacitor/clipboard';
import { validate } from 'bitcoin-address-validation';
import { nip19 } from "nostr-tools";
import { parseNprofile } from "../Api/nostr";

export const Background = () => {

    const router = useIonRouter();
    //reducer
    const nostrSource = useSelector((state) => state.paySource).map((e) => { return { ...e } }).filter((e) => e.pasteField.includes("nprofile"))
    const paySource = useSelector((state) => state.paySource)
    const spendSource = useSelector((state) => state.spendSource)
    const cursor = useSelector(({ history }) => history.cursor) || {}
    const latestOp = useSelector(({ history }) => history.latestOperation) || {}
    const dispatch = useDispatch();
    const [initialFetch, setInitialFetch] = useState(true)
    const [api, contextHolder] = notification.useNotification();
    const [clipText, setClipText] = useState("")
    const { isShown, toggle } = UseModal();
    const latestAckedClipboard = useRef("");
    const isShownRef = useRef(false);

    useEffect(() => {
        isShownRef.current = isShown;
    }, [isShown])

    const openNotification = (placement: NotificationPlacement, header: string, text: string, onClick?: (() => void) | undefined) => {
        api.info({
            message: header,
            description:
                text,
            placement,
            onClick: onClick,
        });
    };
    window.onbeforeunload = function () { return null; };

    useEffect(() => {
        const handleBeforeUnload = () => {
            // Call your function here
            localStorage.setItem("lastOnline", Date.now().toString())
            localStorage.setItem("getHistory", "false");
            return false;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            return window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, []);

    useEffect(() => {
        const subbed: string[] = []
        nostrSource.forEach(source => {
            const { pubkey, relays } = parseNprofile(source.pasteField)
            if (subbed.find(s => s === pubkey)) {
                return
            }
            subbed.push(pubkey)
            getNostrClient({ pubkey, relays }).then(c => {
                c.GetLiveUserOperations(newOp => {
                    if (newOp.status === "OK") {
                        console.log(newOp)
                        openNotification("top", "Payments", "You received payment.");
                        dispatch(setLatestOperation({ pub: pubkey, operation: newOp.operation }))
                    } else {
                        console.log(newOp.reason)
                    }
                })
            })
        });
    }, [nostrSource.length])

    useEffect(() => {
        const nostrSpends = spendSource.filter((e) => e.icon == "0");
        const otherPaySources = paySource.filter((e) => e.icon != "0");
        const otherSpendSources = spendSource.filter((e) => e.icon != "0");

        if ((nostrSpends.length != 0 && nostrSpends[0].balance != "0") || (otherPaySources.length > 0 || otherSpendSources.length > 0)) {
            if (localStorage.getItem("isBackUp") == "1") {
                return;
            }
            console.log("changed", otherPaySources, otherSpendSources);
            dispatch(addNotification({
                header: 'Reminder',
                icon: '⚠️',
                desc: 'Back up your credentials!',
                date: Date.now(),
                link: '/auth',
            }))
            localStorage.setItem("isBackUp", "1")
            openNotification("top", "Reminder", "Please back up your credentials!", () => { router.push("/auth") });
        }
    }, [paySource, spendSource])

    useEffect(() => {
        if (Object.entries(latestOp).length === 0 && !initialFetch) {
            return
        }
        console.log({ latestOp, initialFetch })
        setInitialFetch(false)
        const sent: string[] = []
        nostrSource.forEach(source => {
            const { pubkey, relays } = parseNprofile(source.pasteField)
            if (sent.find(s => s === pubkey)) {
                return
            }
            sent.push(pubkey)
            getNostrClient({ pubkey, relays }).then(c => {
                const req = populateCursorRequest(cursor)
                c.GetUserOperations(req).then(ops => {
                    if (ops.status === 'OK') {
                        console.log((ops), "ops")
                        const totalHistory = parseOperationsResponse(ops);
                        const lastTimestamp = parseInt(localStorage.getItem('lastOnline') ?? "0")
                        const payments = totalHistory.operations.filter((e) => e.paidAtUnix * 1000 > lastTimestamp)
                        if (payments.length > 0) {
                            if (localStorage.getItem("getHistory") == "true") return;
                            dispatch(addNotification({
                                header: 'Payments',
                                icon: '⚡',
                                desc: 'You received ' + payments.length + ' payments since ' + getFormattedTime(lastTimestamp),
                                date: Date.now(),
                                link: '/home',
                            }))
                            localStorage.setItem("getHistory", "true");
                        }
                        dispatch(setSourceHistory({ pub: pubkey, ...parseOperationsResponse(ops) }))
                    } else {
                        console.log(ops.reason, "ops.reason")
                    }
                })
            })
        })
    }, [latestOp, initialFetch])

    useEffect(() => {
        window.addEventListener("visibilitychange", checkClipboard);
        window.addEventListener("focus", checkClipboard);

        return () => {
            window.removeEventListener("visibilitychange", checkClipboard);
            window.removeEventListener("focus", checkClipboard);
        };
    }, [])

    useEffect(() => {
        checkClipboard();
    }, [])

    const checkClipboard = useCallback( async() => {
        window.onbeforeunload = null;
        let text = '';
        document.getElementById('focus_div')?.focus();
        if (document.hidden) {
            window.focus();
        }
        if (isShownRef.current) {
            return;
        }
        try {
            const { type, value } = await Clipboard.read();
            if (type === "text/plain") {
                text = value;
            }
        } catch (error) {
            console.error('Error reading clipboard data:', error);
        }
        text = text.replaceAll('lightning:', "")
        if (!text.length) {
            return
        }
        if (text === latestAckedClipboard.current) {
            return
        }
        const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const boolLnAddress = expression.test(text);
        let boolLnInvoice = false;
        if (text.startsWith("ln") && nostrSource.length > 0) {

            const result = await (await getNostrClient(nostrSource[0].pasteField)).DecodeInvoice({ invoice: text });
            boolLnInvoice = result.status == "OK";
        }
        const boolAddress = validate(text);
        const boolLnurl = text.startsWith("lnurl");
        if (boolAddress || boolLnInvoice || boolLnAddress || boolLnurl) {
            setClipText(text);
            toggle();
        }
    }, [nostrSource, toggle]);

    const clipBoardContent = <React.Fragment>
        <div className='Home_modal_header'>Clipboard Detected</div>
        <div className='Home_modal_discription'>Would you like to use it?</div>
        <div className='Home_modal_clipboard'>{clipText}</div>
        <div className="Home_add_btn">
            <div className='Home_add_btn_container'>
                <button onClick={() => { toggle(); latestAckedClipboard.current = clipText; }}>
                    {icons.Close()}NO
                </button>
            </div>
            <div className='Home_add_btn_container'>
                <button onClick={() => { toggle(); latestAckedClipboard.current = clipText; router.push("/send?url=" + clipText) }}>
                    {icons.clipboard()}YES
                </button>
            </div>
        </div>
    </React.Fragment>;

    return <div id="focus_div">
        {contextHolder}
        <Modal isShown={isShown} hide={toggle} modalContent={clipBoardContent} headerText={''} />
    </div>
}

const populateCursorRequest = (p: Partial<Types.GetUserOperationsRequest>): Types.GetUserOperationsRequest => {
    console.log(p)
    return {
        // latestIncomingInvoice: p.latestIncomingInvoice || 0,
        // latestOutgoingInvoice: p.latestOutgoingInvoice || 0,
        // latestIncomingTx: p.latestIncomingTx || 0,
        // latestOutgoingTx: p.latestOutgoingTx || 0,
        // latestIncomingUserToUserPayment: p.latestIncomingUserToUserPayment || 0,
        // latestOutgoingUserToUserPayment: p.latestOutgoingUserToUserPayment || 0,

        latestIncomingInvoice: 0,
        latestOutgoingInvoice: 0,
        latestIncomingTx: 0,
        latestOutgoingTx: 0,
        latestIncomingUserToUserPayment: 0,
        latestOutgoingUserToUserPayment: 0,
    }
}

const parseOperationsResponse = (r: Types.GetUserOperationsResponse): { cursor: Types.GetUserOperationsRequest, operations: Types.UserOperation[] } => {
    const cursor = {
        latestIncomingInvoice: r.latestIncomingInvoiceOperations.toIndex,
        latestOutgoingInvoice: r.latestOutgoingInvoiceOperations.toIndex,
        latestIncomingTx: r.latestIncomingTxOperations.toIndex,
        latestOutgoingTx: r.latestOutgoingTxOperations.toIndex,
        latestIncomingUserToUserPayment: r.latestIncomingUserToUserPayemnts.toIndex,
        latestOutgoingUserToUserPayment: r.latestOutgoingUserToUserPayemnts.toIndex,
    }
    const operations = [
        ...r.latestIncomingInvoiceOperations.operations,
        ...r.latestOutgoingInvoiceOperations.operations,
        ...r.latestIncomingTxOperations.operations,
        ...r.latestOutgoingTxOperations.operations,
        ...r.latestIncomingUserToUserPayemnts.operations,
        ...r.latestOutgoingUserToUserPayemnts.operations,
    ]
    console.log({ operations })
    return { cursor, operations }
}
