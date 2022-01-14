import { BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolPriceHistory } from "../../../generated/schema";
import { MILLIS } from "../global/globals";

export function getBasicPoolPriceHistory(
  timestamp: BigInt,
  pool: string,
  price: BigInt,
  supply: BigInt,
  poolBase: BigInt
): BasicPoolPriceHistory {
  let ts = timestamp.div(BigInt.fromI32(MILLIS));
  let id = pool.toString() + ts.toString();
  let history = BasicPoolPriceHistory.load(id);
  if (history == null) {
    history = new BasicPoolPriceHistory(id);
    history.pool = pool;
    history.price = price;
    history.supply = supply;
    history.seconds = ts;
    history.poolBase = poolBase;
  }
  return history;
}
