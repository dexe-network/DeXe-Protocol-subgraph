import { Bytes } from "@graphprotocol/graph-ts";
import { Exchange } from "../../../generated/schema";

export function getExchange(hash: Bytes, fromToken: Bytes, toToken: Bytes): Exchange {
  let id = hash.toHexString();
  let exchange = Exchange.load(id);

  if (exchange == null) {
    exchange = new Exchange(id);
    exchange.fromToken = fromToken;
    exchange.toToken = toToken;

    exchange.transaction = "";
  }

  return exchange;
}
