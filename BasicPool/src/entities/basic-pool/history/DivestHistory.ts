import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getDivestHistory(timestamp: BigInt, basicPool: Address): DivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let poolId = getBasicTraderPool(basicPool).id;
  let id = poolId + day.toString();
  let history = DivestHistory.load(id);

  if (history == null) {
    history = new DivestHistory(id);

    history.totalDivestVolume = BigInt.zero();
    history.basicPool = poolId;
    history.day = day;
  }

  return history;
}
