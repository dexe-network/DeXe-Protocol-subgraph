import { BigInt } from "@graphprotocol/graph-ts";
import { TraderPool, TraderPoolHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getTraderPoolHistory(pool: TraderPool, timestamp: BigInt): TraderPoolHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool.id.toHexString() + day.toString();
  let history = TraderPoolHistory.load(id);

  if (history == null) {
    history = new TraderPoolHistory(id);
    history.pool = pool.id;
    history.investors = pool.investors;
    history.investorsCount = pool.investorsCount;
    history.privateInvestors = pool.privateInvestors;
    history.privateInvestorsCount = pool.privateInvestorsCount;
    history.day = day;
  }

  return history;
}
