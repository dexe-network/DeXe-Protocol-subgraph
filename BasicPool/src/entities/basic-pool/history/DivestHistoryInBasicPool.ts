import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistoryInBasicPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getDivestHistoryInBasicPool(timestamp: BigInt, basicPool: Address): DivestHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = basicPool.toString() + day.toString();
  let history = DivestHistoryInBasicPool.load(id);

  if (history == null) {
    history = new DivestHistoryInBasicPool(id);

    history.totalDivestVolume = BigInt.fromI32(0);
    history.basicPool = getBasicTraderPool(basicPool).id;
    history.day = day;
  }

  return history;
}
