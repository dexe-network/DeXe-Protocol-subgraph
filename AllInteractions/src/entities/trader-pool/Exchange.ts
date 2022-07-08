import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Exchange } from "../../../generated/schema";

export function getExchange(
  hash: Bytes,
  pool: Bytes,
  fromToken: Bytes,
  toToken: Bytes,
  fromVolume: BigInt,
  toVolume: BigInt
): Exchange {
  let exchange = Exchange.load(hash);

  if (exchange == null) {
    exchange = new Exchange(hash);
    exchange.pool = pool;
    exchange.fromToken = fromToken;
    exchange.toToken = toToken;

    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;

    exchange.transaction = Bytes.empty();
  }

  return exchange;
}
