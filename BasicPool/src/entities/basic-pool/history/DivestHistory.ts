import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getDivestHistory(timestamp: BigInt, basicPool: Address): DivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = basicPool.toString() + day.toString();
  let history = DivestHistory.load(id);

  if (history == null) {
    history = new DivestHistory(id);

    history.totalDivestVolume = BigInt.fromI32(0);
    history.basicPool = getBasicTraderPool(basicPool).id;
    history.day = day;
  }

  return history;
}
