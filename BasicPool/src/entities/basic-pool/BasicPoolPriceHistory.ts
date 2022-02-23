import { BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolPriceHistory } from "../../../generated/schema";
import { DECIMAL } from "../global/globals";

export function getBasicPoolPriceHistory(
  pool: string,
  price: BigInt,
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
    history.usdTVL = price;
    history.supply = supply;
    history.seconds = timestamp;
    history.baseTVL = poolBase;
    history.absPNL = price.minus(BigInt.fromU64(DECIMAL));
    history.percPNL = price.minus(BigInt.fromU64(DECIMAL)).div(BigInt.fromI32(100));
  }
  return history;
}
