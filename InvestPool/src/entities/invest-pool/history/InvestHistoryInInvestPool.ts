import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getInvestHistoryInInvestPool(timestamp: BigInt, investPool: Address): InvestHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = investPool.toString() + day.toString();
  let history = InvestHistoryInInvestPool.load(id);

  if (history == null) {
    history = new InvestHistoryInInvestPool(id);

    history.totalInvestVolume = BigInt.fromI32(0);
    history.investPool = getInvestTraderPool(investPool).id;
    history.day = day;
  }

  return history;
}
