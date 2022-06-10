import { BigInt } from "@graphprotocol/graph-ts";
import { VestHistory, TraderPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getVestHistory(timestamp: BigInt, traderPool: TraderPool): VestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = traderPool.id + day.toString();
  let history = VestHistory.load(id);

  if (history == null) {
    history = new VestHistory(id);

    history.totalInvestBaseVolume = BigInt.zero();
    history.totalDivestBaseVolume = BigInt.zero();
    history.totalInvestUSDVolume = BigInt.zero();
    history.totalDivestUSDVolume = BigInt.zero();
    history.pool = traderPool.id;
    history.day = day;
  }

  return history;
}
