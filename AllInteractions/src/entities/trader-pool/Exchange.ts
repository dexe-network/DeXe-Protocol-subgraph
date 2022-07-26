import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Exchange } from "../../../generated/schema";

export function getExchange(
  hash: Bytes,
  pool: Bytes,
  fromToken: Bytes,
  toToken: Bytes,
  fromVolume: BigInt,
  toVolume: BigInt,
  count: BigInt
): Exchange {
  let id = hash.concatI32(count.toI32());
  let exchange = Exchange.load(id);

  if (exchange == null) {
    exchange = new Exchange(id);
    exchange.pool = pool;
    exchange.fromToken = fromToken;
    exchange.toToken = toToken;

    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;

    exchange.transaction = Bytes.empty();
  }

  return exchange;
}
