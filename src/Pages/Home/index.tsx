import { useEffect, useState } from "react";
import moment from 'moment'
//It import svg icons library
import * as Icons from "../../Assets/SvgIconLibrary";

import { SpendFrom, TransactionInterface, sw_item } from "../../globalTypes";
import { useDispatch, useSelector } from "../../State/store";
import { SwItem } from "../../Components/SwItem";
import { bech32 } from "bech32";
import { Buffer } from "buffer";
import axios from "axios";
import { getNostrClient } from "../../Api";
import { editSpendSources } from "../../State/Slices/spendSourcesSlice";
import { notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";
import * as Types from "../../Api/autogenerated/ts/types"
import { getIdentifierLink } from "../../State/Slices/addressbookSlice";
export const Home = () => {
  const price = useSelector((state) => state.usdToBTC);
  const spendSources = useSelector((state) => state.spendSource);
  const operationGroups = useSelector(({ history }) => history.operations) || {}
  const operationsUpdateHook = useSelector(({ history }) => history.operationsUpdateHook) || 0
  const addressbook = useSelector(({ addressbook }) => addressbook)

  const [error, setError] = useState("")
  const [balance, setBalance] = useState('0.00')
  const [money, setMoney] = useState("0")
  const [items, setItems] = useState<JSX.Element[]>([])
  const [onTheWay, setOnTheWay] = useState(0)

  const [SwItemArray, setSwItemArray] = useState<sw_item[]>([]);
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement: NotificationPlacement, header: string, text: string, onClick?: (() => void) | undefined) => {
    api.info({
      message: header,
      description:
        text,
      placement,
      onClick: onClick,
    });
  };

  useEffect(() => {
    if (!operationGroups) {
      return
    }
    transactionsView();
    // console.log(transactions,"transactions");
    // var boxArray = [];
    // for (let i = transactions.length-1; i >= 0; i--) {
    //   boxArray.push(transactions[i])
    // }

    // setSwItemArray(boxArray.map((o, i) => ({
    //   priceImg: o.inbound ? Icons.PriceUp : Icons.PriceDown,
    //   station: o.destination.length < 20 ? o.destination : `${o.destination.substring(0, 9)}...${o.destination.substring(o.destination.length - 9, o.destination.length)}`,
    //   changes: `${o.inbound ? "" : "-"}${o.amount}`,
    //   date: moment(o.time).fromNow(),
    //   price: Math.round(100 * parseInt(o.amount) * price.sellPrice / (100 * 1000 * 1000)) / 100,
    //   stateIcon: 'lightning',
    //   underline: i !== transactions.length - 1
    // })) || [])

  }, [operationsUpdateHook]);

  const transactionsView = () => {
    console.log(price, operationGroups)
    const entries = Object.entries(operationGroups).filter(([_, v]) => { console.log({ v }); return v.length > 0 })
    if (entries.length === 0) {
      console.log("no operations to display")
      // transactionsView();
      // return
    }
    const collapsed: (Types.UserOperation & { nprofile: string })[] = []
    entries.forEach(([nprofile, operations]) => { if (operations) collapsed.push(...operations.map(o => ({ ...o, nprofile }))) })
    collapsed.sort((a: any, b: any) => b.paidAtUnix - a.paidAtUnix);
    let totalPending = 0
    setSwItemArray(collapsed.map((o, i) => {
      const label = getIdentifierLink(addressbook, o.identifier)
      if (o.type === Types.UserOperationType.INCOMING_TX && !o.confirmed) {
        totalPending += o.amount
      }
      return {
        priceImg: o.inbound ? Icons.PriceUp : Icons.PriceDown,
        station: label.length < 20 ? label : `${label.substring(0, 9)}...${label.substring(label.length - 9, label.length)}`,
        changes: `${o.inbound ? "" : "-"}${o.amount}`,
        date: moment(o.paidAtUnix * 1000).fromNow(),
        price: Math.round(100 * o.amount * price.sellPrice / (100 * 1000 * 1000)) / 100,
        stateIcon: 'lightning',
        underline: i !== collapsed.length - 1
      }
    }) || [])
    setOnTheWay(totalPending)
  }

  useEffect(() => {
    resetSpendFrom();
  }, []);

  useEffect(() => {
    getSumBalances();
  }, [spendSources]);

  const getSumBalances = () => {
    let totalAmount = 0;
    for (let i = 0; i < spendSources.length; i++) {
      const eachAmount = spendSources[i].balance;
      totalAmount += parseInt(eachAmount);
    }
    setBalance(totalAmount.toString());
    setMoney(totalAmount == 0 ? "0" : (totalAmount * price.buyPrice * 0.00000001).toFixed(2))
  }

  const resetSpendFrom = async () => {
    let box: any = spendSources.map((e: SpendFrom) => { return { ...e } });
    await box.map(async (e: SpendFrom, i: number) => {
      const element = e;
      if (element.pasteField.includes("nprofile")) {
        let balanceOfNostr = "0";
        try {
          await (await getNostrClient(element.pasteField)).GetUserInfo().then(res => {
            if (res.status !== 'OK') {
              console.log(res.reason, "reason");
              return
            }
            balanceOfNostr = res.max_withdrawable.toString()
          })
          box[i].balance = balanceOfNostr;
          dispatch(editSpendSources(box[i]));
        } catch (error) {
          return openNotification("top", "Error", "Couldn't connect to relays");
        }
      } else {
        let { prefix: s, words: dataPart } = bech32.decode(element.pasteField.replace("lightning:", ""), 2000);
        let sourceURL = bech32.fromWords(dataPart);
        const lnurlLink = Buffer.from(sourceURL).toString()
        let amountSats = "0";
        try {
          const amount = await axios.get(lnurlLink);
          amountSats = (amount.data.maxWithdrawable / 1000).toString();

          box[i].balance = parseInt(amountSats).toString();
          dispatch(editSpendSources(box[i]));
        } catch (error: any) {
          box[i].balance = amountSats;
          dispatch(editSpendSources(box[i]));
          console.log(error.response.data.reason);
          return openNotification("top", "Error", (i + 1) + " " + error.response.data.reason);
        }
      }
    });
  }

  const ArrangeData = SwItemArray.map((o, i): JSX.Element => <SwItem
    stateIcon={o.stateIcon}
    station={o.station}
    changes={o.changes}
    price={o.price}
    priceImg={o.priceImg}
    date={o.date}
    key={i}
    underline={o.underline}
  />);

  return (
    <div className="Home">
      {contextHolder}
      <div className="Home_sats">
        {onTheWay && <p>{onTheWay} sats are on the way!</p>}
        <div className="Home_sats_amount">{balance}</div>
        <div className="Home_sats_name">sats</div>
        <div className="Home_sats_changes">~ ${money}</div>
      </div>
      <div className="Home_scroller scroller">
        <div className="Home_content">
          {ArrangeData}
        </div>
      </div>
    </div>
  )
}