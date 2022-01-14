import { BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolPriceHistory } from "../../../generated/schema";
import { MILLIS } from "../global/globals";

export function getInvestPoolPriceHistory(
  timestamp: BigInt,
  pool: string,
  price: BigInt,
  supply: BigInt,
  poolBase: BigInt
): InvestPoolPriceHistory {
  let ts = timestamp.div(BigInt.fromI32(MILLIS));
  let id = pool.toString() + ts.toString();
  let history = InvestPoolPriceHistory.load(id);
  if (history == null) {
    history = new InvestPoolPriceHistory(id);
    history.pool = pool;
    history.price = price;
    history.supply = supply;
    history.poolBase = poolBase;
    history.seconds = ts;
  }
  return history;
}
