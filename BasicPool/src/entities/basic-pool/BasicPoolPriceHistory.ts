import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolPriceHistory } from "../../../generated/schema";
import { MILLIS } from "../global/globals";

export function getBasicPoolPriceHistory(
  pool: string,
  price: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero()
): BasicPoolPriceHistory {
  let ts = timestamp.div(BigInt.fromI32(MILLIS));
  let id = pool + blockNumber.toString();
  let history = BasicPoolPriceHistory.load(id);
  if (history == null) {
    history = new BasicPoolPriceHistory(id);
    history.pool = pool;
    history.price = price;
    history.supply = supply;
    history.seconds = ts;
    history.poolBase = poolBase;
    history.loss = BigInt.zero();
  }
  return history;
}
