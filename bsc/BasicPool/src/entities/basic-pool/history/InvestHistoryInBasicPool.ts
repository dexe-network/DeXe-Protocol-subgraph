import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistoryInBasicPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getInvestHistoryInBasicPool(
  timestamp: BigInt,
  basicPool: Address
): InvestHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY)) 
  let id = basicPool.toString() + day.toString();
  let history = InvestHistoryInBasicPool.load(id);

  if (history == null) {
    history = new InvestHistoryInBasicPool(id);

    history.totalInvestVolume = BigInt.fromI32(0);
    history.basicPool = getBasicTraderPool(basicPool).id;
    history.day = day;
  }

  return history;
}
