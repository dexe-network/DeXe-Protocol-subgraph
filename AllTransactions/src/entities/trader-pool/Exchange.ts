import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Exchange } from "../../../generated/schema";

export function getExchange(
  hash: Bytes,
  fromToken: Bytes,
  toToken: Bytes,
  fromVolume: BigInt,
  toVolume: BigInt
): Exchange {
  let id = hash.toHexString();
  let exchange = Exchange.load(id);

  if (exchange == null) {
    exchange = new Exchange(id);
    exchange.fromToken = fromToken;
    exchange.toToken = toToken;

    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;

    exchange.transaction = "";
  }

  return exchange;
}
