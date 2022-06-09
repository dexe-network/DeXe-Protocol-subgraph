import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory, TraderPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getDivestHistory(timestamp: BigInt, traderPool: TraderPool): DivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = traderPool.id + day.toString();
  let history = DivestHistory.load(id);

  if (history == null) {
    history = new DivestHistory(id);

    history.totalDivestVolume = BigInt.zero();
    history.pool = traderPool.id;
    history.day = day;
  }

  return history;
}
