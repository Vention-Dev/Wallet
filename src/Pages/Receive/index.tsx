import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { getNostrClient } from '../../Api'

//It import svg icons library
import * as Icons from "../../Assets/SvgIconLibrary";
import { AddressType } from '../../Api/autogenerated/ts/types';
import { UseModal } from '../../Hooks/UseModal';
import { notification } from 'antd';
import { NotificationPlacement } from 'antd/es/notification/interface';
import { isAxiosError } from 'axios';
import { Modal } from '../../Components/Modals/Modal';
import { useIonRouter } from '@ionic/react';
import { Buffer } from 'buffer';
import { bech32 } from 'bech32';
import { useSelector } from '../../State/store';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from "@capacitor/share";
import { useDispatch } from '../../State/store';
import { addAsset } from '../../State/Slices/generatedAssets';
import { createLnurlInvoice, createNostrInvoice, createNostrPayLink } from '../../Api/helpers';
import { parseBitcoinInput } from '../../constants';
import { toggleLoading } from '../../State/Slices/loadingOverlay';

const headerText: string[] = [
  'LNURL',
  'Lightning Invoice',
  'On-chain Address'
]

const buttonText: string[] = [
  'LNURL',
  'INVOICE',
  'CHAIN'
]

const openNotification = (placement: NotificationPlacement, header: string, text: string) => {
  notification.info({
    message: header,
    description:
      text,
    placement
  });
};

export const Receive = () => {
  const dispatch = useDispatch();
  //reducer
  const paySource = useSelector((state) => state.paySource)
  const receiveHistory = useSelector((state) => state.history);

  const price = useSelector((state) => state.usdToBTC);
  const [deg, setDeg] = useState("rotate(0deg)");
  const [vReceive, setVReceive] = useState(1);
  const { isShown, toggle } = UseModal();
  const [amount, setAmount] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [LNInvoice, setLNInvoice] = useState("");
  const [LNurl, setLNurl] = useState("");
  const [valueQR, setQR] = useState("");
  const [lightningAdd, setLightningAdd] = useState("");
  const [tag, setTag] = useState(0);
  const [bitcoinAdd, setBitcoinAdd] = useState("");
  const [bitcoinAddText, setBitcoinAddText] = useState("");
  const [invoiceMemo, setInvoiceMemo] = useState("");
  const router = useIonRouter();
  const nostrSource = paySource.filter((e) => e.pasteField.includes("nprofile"));
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isShown && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [isShown])



  const setValueQR = (param: string) => {
    setQR(param/* .toUpperCase() */);
  }



  useEffect(() => {
    if (paySource.length === 0) {
      setTimeout(() => {
        router.push("/home");
      }, 1000);
      return openNotification("top", "Error", "You don't have any sources!");
    } else {
      configLNURL();
      if (paySource[0].pasteField.startsWith("nprofile")) {
        ChainAddress();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (receiveHistory.latestOperation !== undefined && receiveHistory.latestOperation.identifier === LNInvoice.replaceAll("lightning:", "")) {
      console.log("got thats what I was looking for")
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    }
  }, [receiveHistory.latestOperation])




  const copyToClip = async () => {
    await Clipboard.write({
      string: valueQR
    })
    dispatch(addAsset({ asset: valueQR }));
    return openNotification("top", "Success", "Copied!");
  };


  const configInvoice = useCallback(async (amountToRecive: string) => {
    const topPaySource = paySource[0];
    let invoice = "";
    try {
      if (topPaySource.pasteField.includes("nprofile")) {
        invoice = await createNostrInvoice(topPaySource.pasteField, +amountToRecive, invoiceMemo);
      } else {
        const parsedPaySource = await parseBitcoinInput(topPaySource.pasteField)
        invoice = await createLnurlInvoice(+amountToRecive, parsedPaySource);
      }
      setValueQR(`lightning:${invoice}`);
      setLNInvoice(`lightning:${invoice}`);
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        openNotification("top", "Error", err.response.data.reason);
      } else if (err instanceof Error) {
        openNotification("top", "Error", err.message);
      } else {
        console.log("Unknown error occured", err);
      }
    }
  }, [paySource, invoiceMemo]);

  const configLNURL = useCallback(async () => {
    dispatch(toggleLoading({ loadingMessage: "Loading..." }))
    if (LNurl !== "") return;
    const topPayToSource = paySource[0];
    if (topPayToSource.pasteField.includes("nprofile")) {
      const lnurl = await createNostrPayLink(topPayToSource.pasteField);
      setLNurl("lightning:" + lnurl);
      setValueQR("lightning:" + lnurl);
    } else if (paySource[0].pasteField.includes("@")) {
      const endpoint = "https://" + paySource[0].pasteField.split("@")[1] + "/.well-known/lnurlp/" + paySource[0].pasteField.split("@")[0];
      const words = bech32.toWords(Buffer.from(endpoint, 'utf8'));
      const lnurl = bech32.encode("lnurl", words, 999999);
      setLightningAdd(topPayToSource.label);
      setLNurl(`lightning:${lnurl}`);
      setValueQR(`lightning:${lnurl}`);
    } else {
      setLightningAdd(topPayToSource.label);
      setLNurl(`lightning:${topPayToSource.pasteField}`);
      setValueQR(`lightning:${topPayToSource.pasteField}`);
    }
    dispatch(toggleLoading({ loadingMessage: "" }));
  }, [LNurl, paySource, dispatch]);


  const ChainAddress = async () => {
    if (bitcoinAdd !== '') return;
    if (!nostrSource.length) return;
    const res = await (await getNostrClient(nostrSource[0].pasteField)).NewAddress({ addressType: AddressType.WITNESS_PUBKEY_HASH })
    if (res.status !== 'OK') {
      openNotification("top", "Error", res.reason);
      setTag(0);
      return
    }
    setBitcoinAdd(res.address);
    setBitcoinAddText(
      res.address.substr(0, 5) + "..." + res.address.substr(res.address.length - 5, 5)
    )
  }

  const updateInvoice = async () => {
    console.log("the memo", invoiceMemo)
    toggle();
    dispatch(toggleLoading({ loadingMessage: "Loading..." }))
    setAmountValue(amount);
    await configInvoice(amount);
    setTag(1);
    dispatch(toggleLoading({ loadingMessage: "" }));
  }

  const changeQRcode = (index: number) => {
    setTag(index);
    switch (index) {
      case 0:
        setValueQR(LNurl);
        break;

      case 1:
        if (!amount) {
          toggle();
          setValueQR("");
          return;
        }
        setValueQR(LNInvoice);
        break;

      case 2:
        if (bitcoinAdd) {
          setValueQR(`bitcoin:${bitcoinAdd}`);
        } else {
          setValueQR("");
        }
        break;

      default:
        break;
    }
  }

  const shareText = async () => {
    try {
      await Share.share({
        title: 'Share',
        text: valueQR,
        dialogTitle: 'Share with'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const setAmountContent = <React.Fragment>
    <div className="Sources_notify">
      <div className="Sources_notify_title">Receive via Invoice</div>
      <div className="Receive_result_input">
        <input
          ref={amountInputRef}
          type="number"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              updateInvoice();
            }

          }}
          onChange={(e) => { setAmount(e.target.value === "" ? "" : parseInt(e.target.value).toString()) }}
          placeholder="Enter amount in sats"
          value={amount}
        />
        <input
          type="text"
          maxLength={90}
          style={{marginTop: "15px"}}
          
          onChange={(e) => setInvoiceMemo(e.target.value)}
          placeholder="Description (optional)"
          value={invoiceMemo}
        />
      </div>
      <div className='Receive_modal_amount'>
        ~ ${parseInt(amount === "" ? "0" : amount) === 0 ? 0 : (parseInt(amount === "" ? "0" : amount) * price.buyPrice * 0.00000001).toFixed(2)}
      </div>
      <button className="Sources_notify_button" onClick={updateInvoice}>OK</button>
    </div>
  </React.Fragment>;

  return (
    <div>
      <div className="Receive" style={{ opacity: vReceive, zIndex: vReceive ? 1000 : -1 }}>
        <div className="Receive_QR_text">{headerText[tag]}</div>
          {
            valueQR
            ?
            <div className="Receive_QR" style={{ transform: deg }}>
              <QRCodeSVG
                style={{ textAlign: "center", transitionDuration: "500ms" }}
                value={valueQR.toUpperCase()}
                size={250}
              />
              <div className="Receive_logo_container">
                {Icons.Logo()}
              </div>
            </div>
            :
            (tag === 2 && !paySource[0].pasteField.includes("nprofile"))
            &&
            <div>Cannot receive on-chain transactions</div> 
          }
        <div className='Receive_copy'> 
          {tag == 1 ? `${amount} ~$` + (parseInt(amountValue === "" ? "0" : amountValue) === 0 ? 0 : (parseInt(amountValue === "" ? "0" : amountValue) * price.buyPrice * 0.00000001).toFixed(2)) : tag == 2 ? bitcoinAddText : lightningAdd}
        </div>
        {
          !(tag === 2 && !paySource[0].pasteField.includes("nprofile"))
          &&
          <>
            {
              tag === 1
              &&
              <div className="Receive_set_amount">
                <button onClick={toggle}>SET AMOUNT</button>
              </div>
            }
            <div className="Receive_set_amount_copy">
              <button onClick={copyToClip} style={{ width: "130px" }}>{Icons.copy()}COPY</button>
              <div style={{ width: "20px" }} />
              <button onClick={shareText} style={{ width: "130px" }}>{Icons.share()}SHARE</button>
            </div>
          </>
        }
        <div className="Receive_other_options">
          <div className="Receive_lnurl">
            <button onClick={() => { changeQRcode((tag + 1) % 3) }}>
              {Icons.arrowLeft()}{buttonText[(tag + 1) % 3]}
            </button>
          </div>
          <div className="Receive_chain">
            <button onClick={() => { changeQRcode((tag + 2) % 3) }}>
              {buttonText[(tag + 2) % 3]}{Icons.arrowRight()}
            </button>
          </div>
        </div>
      </div >
      <Modal isShown={isShown} hide={toggle} modalContent={setAmountContent} headerText={''} />
    </div>
  )
}
