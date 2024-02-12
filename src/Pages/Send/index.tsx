import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { notification } from 'antd';
//It import svg icons library
import * as Icons from "../../Assets/SvgIconLibrary";
import { UseModal } from '../../Hooks/UseModal';
import { useSelector, useDispatch } from '../../State/store';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import axios, { isAxiosError } from 'axios';
import { useIonRouter } from '@ionic/react';
import { Modal } from '../../Components/Modals/Modal';
import SpendFromDropdown from '../../Components/Dropdowns/SpendFromDropdown';
import { defaultMempool } from '../../constants';
import { parseBitcoinInput, InputClassification, Destination } from '../../constants';
import { setLatestOperation } from '../../State/Slices/HistorySlice';
import { parseNprofile } from '../../Api/nostr';
import * as Types from '../../Api/autogenerated/ts/types'
import { ChainFeesInter } from '../Prefs';
import useDebounce from '../../Hooks/useDebounce';
import classnames from "classnames";
import { createLnurlInvoice, handlePayBitcoinAddress, handlePayInvoice } from '../../Api/helpers';
import { toggleLoading } from '../../State/Slices/loadingOverlay';
import { useLocation } from 'react-router';
import { addAddressbookLink, addIdentifierMemo } from '../../State/Slices/addressbookSlice';

const openNotification = (placement: NotificationPlacement, header: string, text: string) => {
  notification.info({
    message: header,
    description:
      text,
    placement
  });
};



export const Send = () => {

  const price = useSelector((state) => state.usdToBTC);
  const location = useLocation();

  //reducer
  const dispatch = useDispatch();
  const spendSources = useSelector((state) => state.spendSource.filter(s => !s.disabled));
  const mempoolUrl = useSelector(({ prefs }) => prefs.mempoolUrl) || defaultMempool;
  const fiatUnit = useSelector((state) => state.prefs.FiatUnit);
  const selectedChainFee = useSelector(({ prefs }) => prefs.selected);

  const [amountAssets, setAmountAssets] = useState("sats");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const { isShown, toggle } = UseModal();
  const [selectedSource, setSelectedSource] = useState(spendSources[0]);
  const [sendRunning, setSendRunning] = useState(false);

  const [satsPerByte, setSatsPerByte] = useState(0)
  const [fiatSymbol, setFiatSymbol] = useState('$')
  
  const [to, setTo] = useState({
    input: "",
    parse: false
  });
  
  const debouncedTo = useDebounce(to.input, 500);
  const [destination, setDestination] = useState<Destination>({
    type: InputClassification.UNKNOWN,
    data: "",
  });

  const vReceive = 1;
  const router = useIonRouter();

  const updateSatsPerByte = useCallback(async () => {
    const res = await axios.get(mempoolUrl)
    const data = res.data as ChainFeesInter
    if (!selectedChainFee) {
      setSatsPerByte(data.economyFee)
      return
    }
    switch (selectedChainFee) {
      case "eco": {
        console.log("eco!")
        setSatsPerByte(data.economyFee)
        break
      }
      case "avg": {
        console.log("avg!")
        setSatsPerByte(Math.ceil((data.hourFee + data.halfHourFee) / 2))
        break
      }
      case "asap": {
        console.log("asap!")
        setSatsPerByte(data.fastestFee)
      }
    }
  }, [mempoolUrl, selectedChainFee]);

  useEffect(() => {
    if (fiatUnit.symbol) {
      setFiatSymbol(fiatUnit.symbol);
    }
  }, [fiatUnit])

  useLayoutEffect(() => {
    if (spendSources.length === 0) {
      openNotification("top", "Error", "You don't have any sources!");
      router.push("/home");
    }
  }, [router, spendSources]);

  useEffect(() => {
    if (location.state) {
      const receivedDestination = location.state as Destination;
      processParsedDestination(receivedDestination);
      setTo({
        input: receivedDestination.data,
        parse: false
      });
    } else {
      const addressSearch = new URLSearchParams(location.search);
      const data = addressSearch.get("url");
      if (data) {
        setTo({
          input: data,
          parse: true
        });
      }
    }
  }, [location]);

  const processParsedDestination = async (parsedInput: Destination) => {
    if (parsedInput.type === InputClassification.LNURL &&  parsedInput.lnurlType !== "payRequest") {
      throw new Error ("Lnurl cannot be a lnurl-withdraw");
    }

    if (parsedInput.type === InputClassification.LN_INVOICE) {
      setAmount(parsedInput.amount as number);
      if (parsedInput.memo) {
        setNote(parsedInput.memo);
      }
    }
    if (parsedInput.type === InputClassification.BITCOIN_ADDRESS) {
      await updateSatsPerByte();
    }

    setDestination(parsedInput);
  }

  useEffect(() => {
    const determineReceiver = async () => {
      try {
        const parsedInput = await parseBitcoinInput(debouncedTo);
        await processParsedDestination(parsedInput);

      } catch (err: any) {
        if (isAxiosError(err) && err.response) {
          openNotification("top", "Error", err.response.data.reason);
        } else if (err instanceof Error) {
          openNotification("top", "Error", err.message);
        } else {
          console.log("Unknown error occured", err);
        }
      }
    }

    if (debouncedTo && to.parse) {
      determineReceiver();
    }
  }, [debouncedTo])



  /* In addition to adding to the transaction history this function also adds to the addressbook.
  *  If there is a note (memo) that's prioritized.
  */
  const paymentSuccess = useCallback((amount: number, identifier: string, type: Types.UserOperationType, { operation_id, network_fee, service_fee }: { operation_id: string, network_fee: number, service_fee: number }) => {
    if (selectedSource.pasteField.includes("nprofile")) {
      const pub = parseNprofile(selectedSource.pasteField).pubkey;
      const now = Date.now() / 1000
      dispatch(setLatestOperation({
        pub: pub, operation: {
          amount, identifier, inbound: false, operationId: operation_id, paidAtUnix: now, type, network_fee, service_fee,
          confirmed: false,
          tx_hash: "", internal: false
        }
      }))
    }
    if (note) {
      dispatch(addIdentifierMemo({ identifier, memo: note }));
    }
    if (destination.type === InputClassification.LNURL) {
      dispatch(addAddressbookLink({ identifier, contact: destination.domainName, address: destination.data }))
    } else if (destination.type === InputClassification.LN_ADDRESS) {
      dispatch(addAddressbookLink({ identifier, contact: destination.data }))
    }
    openNotification("top", "Success", "Transaction sent.");
    router.push("/home")

  }, [dispatch, router, selectedSource, note, destination])

  const handleSubmit = useCallback(async () => {
    if (destination.type === InputClassification.UNKNOWN) {
      return;
    }
    if (sendRunning) {
      return;
    }
    setSendRunning(true);

    dispatch(toggleLoading({ loadingMessage: "Sending..." }));
    try {
      switch (destination.type) {
        case InputClassification.LN_INVOICE: {
          const payRes = await handlePayInvoice(destination.data, selectedSource.pasteField);
          paymentSuccess(amount, destination.data, Types.UserOperationType.OUTGOING_INVOICE, payRes);
          break;
        }
        case InputClassification.LN_ADDRESS: {
          const invoice = await createLnurlInvoice(amount, destination);
          const payRes = await handlePayInvoice(invoice, selectedSource.pasteField);
          paymentSuccess(amount, invoice, Types.UserOperationType.OUTGOING_INVOICE, payRes);
          break;
        }
        case InputClassification.LNURL: {
          const invoice = await createLnurlInvoice(amount, destination);
          const payRes = await handlePayInvoice(invoice, selectedSource.pasteField);
          paymentSuccess(amount, invoice, Types.UserOperationType.OUTGOING_INVOICE, payRes);
          break;
        }
        case InputClassification.BITCOIN_ADDRESS: {
          const payRes = await handlePayBitcoinAddress(selectedSource.pasteField, destination.data, amount, satsPerByte)
          paymentSuccess(+amount, destination.data, Types.UserOperationType.OUTGOING_TX, payRes);
        }
      }
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        openNotification("top", "Error", err.response.data.reason);
      } else if (err instanceof Error) {
        openNotification("top", "Error", err.message);
      } else {
        console.log("Unknown error occured", err);
      }
    }
    dispatch(toggleLoading({ loadingMessage: "" }));
    setSendRunning(false);

  }, [amount, destination, paymentSuccess, sendRunning, dispatch, selectedSource, satsPerByte,]);




  const confirmContent = <React.Fragment>
    <div className="Sources_notify">
      <div className="Sources_notify_title">Amount to Receive</div>
      <button className="Sources_notify_button" onClick={toggle}>OK</button>
    </div>
  </React.Fragment>;

  const setMaxValue = () => {
    if (selectedSource.pasteField.includes("nprofile") && !destination.isPub && selectedSource.maxWithdrawable) {
      setAmount(parseInt(selectedSource.maxWithdrawable))
    } else {
      setAmount(parseInt(selectedSource.balance))
    }
  }




  return (
    <div className='Send_container'>
      <div className="Send" style={{ opacity: vReceive, zIndex: vReceive ? 1000 : -1 }}>
        <div className="Send_header_text">Send Payment</div>
        <div className="Send_config">
          <div className="Send_amount">
            Amount:
            <div className='Send_amount_container'>
              <div className="Send_maxButton">
                {destination.type !== InputClassification.LN_INVOICE ? <button onClick={setMaxValue}>Max</button> : <div></div>}
              </div>
              <input id="send-amount-input" className="Send_amount_input" type="number" value={amount || ""} readOnly={destination.type === InputClassification.LN_INVOICE} onChange={(e) => { setAmount(+e.target.value) }} />
              <button onClick={() => { setAmountAssets(amountAssets === "BTC" ? "sats" : "BTC") }}>{amountAssets}</button>
            </div>
          </div>
          <div className='Send_available_amount'>
            {!!satsPerByte && <div className='Send_available_amount_sats'>
              <input type='number' value={satsPerByte} onChange={e => setSatsPerByte(+e.target.value)} />
              Sats per vByte
            </div>}
            <p className='Send_available_amount_amount'>
              ~ {fiatSymbol} {amount === 0 ? 0 : (amount * price.buyPrice * (amountAssets === "BTC" ? 1 : 0.00000001)).toFixed(2)}
            </p>
          </div>
          <div className="Send_to">
            <p>To:</p>
            <input id="bitcoin-input" type="text" placeholder="Invoice, Bitcoin or Lightning Address, nPub, Email" value={to.input} onChange={(e) => setTo({input: e.target.value.toLocaleLowerCase(), parse: true})} />
          </div>
          <div className="Send_for">
            <p>For:</p>
            <input id="memo-input" type="text" placeholder="Add a note" value={note} onChange={(e) => { setNote(e.target.value) }} />
          </div>
          <div className="Send_from">
            <p>Spend From:</p>
            <SpendFromDropdown values={spendSources} initialValue={spendSources[0]} callback={setSelectedSource} />
          </div>
        </div>
      </div>
      <div className="Send_other_options">
        <div className="Send_lnurl">
          <div className="Send_set_amount_copy">
            <button onClick={() => { router.push("/home") }}>{Icons.Close()}CANCEL</button>
          </div>
        </div>
        <div className="Send_chain">
          <div className={classnames({
            ["Send_set_amount_copy"]: true,
            ["Send_not_clickable"]: destination.type === InputClassification.UNKNOWN
          })}>
            <button id="send-button" onClick={handleSubmit}>{Icons.send()}SEND</button>
          </div>
        </div>
      </div>
      <Modal isShown={isShown} hide={toggle} modalContent={confirmContent} headerText={''} />
    </div>
  )
}