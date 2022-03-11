import { BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolPriceHistory } from "../../../generated/schema";
import { DECIMAL, PERCENTAGE } from "../global/globals";

export function getBasicPoolPriceHistory(
  pool: string,
  usdTVL: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero()
): BasicPoolPriceHistory {
  let id = pool + blockNumber.toString();
  let history = BasicPoolPriceHistory.load(id);
  if (history == null) {
    history = new BasicPoolPriceHistory(id);
    history.pool = pool;
    history.usdTVL = usdTVL;
    history.supply = supply;
    history.seconds = timestamp;
    history.baseTVL = poolBase;
    history.absPNL = usdTVL.minus(BigInt.fromU64(DECIMAL));
    history.percPNL = usdTVL.minus(BigInt.fromU64(DECIMAL)).div(BigInt.fromU64(PERCENTAGE));
  }
  return history;
}
