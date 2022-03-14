import { BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolPriceHistory } from "../../../generated/schema";
import { DECIMAL, PERCENTAGE } from "../global/globals";

export function getInvestPoolPriceHistory(
  pool: string,
  usdTVL: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero()
): InvestPoolPriceHistory {
  let id = pool + blockNumber.toString();
  let history = InvestPoolPriceHistory.load(id);
  if (history == null) {
    history = new InvestPoolPriceHistory(id);
    history.pool = pool;
    history.usdTVL = usdTVL;
    history.supply = supply;
    history.baseTVL = poolBase;
    history.seconds = timestamp;
    history.absPNL = usdTVL.minus(BigInt.fromU64(DECIMAL));
    history.percPNL = usdTVL.minus(BigInt.fromU64(DECIMAL)).div(BigInt.fromU64(PERCENTAGE));
  }
  return history;
}
