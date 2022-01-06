import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../InvestTraderPool";

export function getInvestHistoryInInvestPool(
  timestamp: BigInt,
  investPool: Address
): InvestHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = InvestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new InvestHistoryInInvestPool(id.toString());

    history.totalInvestVolume = BigInt.fromI32(0);
    history.investPool = getBasicTraderPool(investPool).id;
  }

  return history;
}
