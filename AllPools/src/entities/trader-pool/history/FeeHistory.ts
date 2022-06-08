import { BigInt } from "@graphprotocol/graph-ts";
import { FeeHistory, TraderPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getFeeHistory(pool: TraderPool, timestamp: BigInt): FeeHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool.id + day.toString();
  let history = FeeHistory.load(id);

  if (history == null) {
    history = new FeeHistory(id);
    history.traderPool = pool.id;
    history.PNL = BigInt.zero();
    history.day = day;
    history.prevHistory = "";
  }

  return history;
}
