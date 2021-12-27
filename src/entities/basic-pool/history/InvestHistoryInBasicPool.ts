import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistoryInBasicPool } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getInvestHistoryInBasicPool(
  timestamp: BigInt,
  basicPool: Address
): InvestHistoryInBasicPool {
  let id = timestamp.div(BigInt.fromU32(86400));
  let history = InvestHistoryInBasicPool.load(id.toString());

  if (history == null) {
    history = new InvestHistoryInBasicPool(id.toString());

    history.totalInvestVolume = BigInt.fromI32(0);
    history.basicPool = getBasicTraderPool(basicPool).id;
  }

  return history;
}
