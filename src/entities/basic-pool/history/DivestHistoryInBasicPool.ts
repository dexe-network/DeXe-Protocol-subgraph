import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistoryInBasicPool } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getDivestHistoryInBasicPool(
  timestamp: BigInt,
  basicPool: Address = Address.zero()
): DivestHistoryInBasicPool {
  let id = timestamp.div(BigInt.fromU32(86400));
  let history = DivestHistoryInBasicPool.load(id.toString());

  if (history == null) {
    history = new DivestHistoryInBasicPool(id.toString());

    history.totalDivestVolume = BigInt.fromI32(0);
    history.quitInvestors = BigInt.fromI32(0);
    history.basicPool = getBasicTraderPool(basicPool).id;
  }

  return history;
}
