import { BigInt } from "@graphprotocol/graph-ts";
import { TraderPoolPriceHistory } from "../../../generated/schema";
import { DECIMAL, PERCENTAGE } from "../global/globals";

export function getTraderPoolPriceHistory(
  pool: string,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  usdTVL: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero()
): TraderPoolPriceHistory {
  let id = pool + blockNumber.toString();
  let history = TraderPoolPriceHistory.load(id);
  if (history == null) {
    let currentPrice = supply.equals(BigInt.zero()) ? BigInt.zero() : usdTVL.div(supply);

    history = new TraderPoolPriceHistory(id);
    history.pool = pool;
    history.usdTVL = usdTVL;
    history.supply = supply;
    history.seconds = timestamp;
    history.baseTVL = poolBase;
    history.absPNL = currentPrice.minus(BigInt.fromU64(DECIMAL));
    history.percPNL = BigInt.fromU64(DECIMAL).div(currentPrice).times(BigInt.fromU64(PERCENTAGE));
    history.isLast = true;
  }
  return history;
}
