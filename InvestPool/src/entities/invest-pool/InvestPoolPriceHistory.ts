import { BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolPriceHistory } from "../../../generated/schema";
import { MILLIS } from "../global/globals";

export function getInvestPoolPriceHistory(
  pool: string,
  price: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero()
): InvestPoolPriceHistory {
  let ts = timestamp.div(BigInt.fromI32(MILLIS));
  let id = pool + blockNumber.toString();
  let history = InvestPoolPriceHistory.load(id);
  if (history == null) {
    history = new InvestPoolPriceHistory(id);
    history.pool = pool;
    history.price = price;
    history.supply = supply;
    history.poolBase = poolBase;
    history.seconds = ts;
    history.loss = BigInt.zero();
  }
  return history;
}
