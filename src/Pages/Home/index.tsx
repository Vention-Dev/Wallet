import { useEffect, useMemo, useState } from "react";

import { useSelector } from "../../State/store";
import { SwItem } from "../../Components/SwItem";
import * as Types from "../../Api/autogenerated/ts/types"

export type TransactionInfo = Types.UserOperation & { source: string, sourceLabel: string };
export const Home = () => {
  const price = useSelector((state) => state.usdToBTC);
  const fiatUnit = useSelector((state) => state.prefs.FiatUnit);
  const spendSources = useSelector((state) => state.spendSource);
  const operationGroups = useSelector(({ history }) => history.operations) || {}
  const operationsUpdateHook = useSelector(({ history }) => history.operationsUpdateHook) || 0

  const [balance, setBalance] = useState('0.00')
  const [fiatSymbol, setFiatSymbol] = useState('$')
  const [money, setMoney] = useState("0")

  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);

  useEffect(() => {
    if (fiatUnit.symbol) {
      setFiatSymbol(fiatUnit.symbol);
    }
  }, [fiatUnit])

  useEffect(() => {
    if (!operationGroups) {
      return
    }
    const populatedEntries = Object.entries(operationGroups).filter(([, operations]) => operations.length > 0);
    if (populatedEntries.length === 0) {
      console.log("No operations to display");
      return;
    }


    const collapsed: (Types.UserOperation & { source: string, sourceLabel: string })[] = []
    populatedEntries.forEach(([source, operations]) => {
      if (operations) collapsed.push(...operations.map(o => ({ ...o, source, sourceLabel: spendSources.sources[source]?.label || "a deleted" })))
    })
    console.log("collpased:", collapsed)
    collapsed.sort((a, b) => b.paidAtUnix - a.paidAtUnix);
    setTransactions(collapsed);
  }, [operationsUpdateHook]);

  useEffect(() => {
    let totalAmount = 0;
    for (let i = 0; i < spendSources.order.length; i++) {
      const eachAmount = spendSources.sources[spendSources.order[i]].balance;
      totalAmount += parseInt(eachAmount);
    }
    setBalance(totalAmount.toString());
    setMoney(totalAmount == 0 ? "0" : (totalAmount * price.buyPrice * 0.00000001).toFixed(2))
  }, [spendSources, price]);

  const transactionsToRender = useMemo(() => {
    return transactions.map((o, i) => {
      return <SwItem operation={o} key={o.operationId} underline={i !== transactions.length - 1} />
    })
  }, [transactions])

  return (
    <div className="Home">
      <div className="Home_sats">
        {/* {!!onTheWay && <p>{onTheWay} sats are on the way!</p>} */}
        <div className="Home_sats_amount">{balance}</div>
        <div className="Home_sats_name">sats</div>
        <div className="Home_sats_changes">~ {fiatSymbol} {money}</div>
      </div>
      <div className="Home_scroller scroller">
        <div className="Home_content">
          {transactionsToRender}
        </div>
      </div>
    </div>
  )
}
