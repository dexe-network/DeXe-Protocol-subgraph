import { BigInt } from "@graphprotocol/graph-ts";
import { InvestHistory, TraderPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getInvestHistory(timestamp: BigInt, traderPool: TraderPool): InvestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = traderPool.id + day.toString();
  let history = InvestHistory.load(id);

  if (history == null) {
    history = new InvestHistory(id);

    history.totalInvestVolume = BigInt.zero();
    history.pool = traderPool.id;
    history.day = day;
  }

  return history;
}
