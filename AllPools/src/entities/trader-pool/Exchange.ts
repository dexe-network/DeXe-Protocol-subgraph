import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { Exchange } from "../../../generated/schema";

export function getExchange(
  txHash: Bytes,
  position: string,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  opening: boolean = false,
  suffix: string = "_0"
): Exchange {
  let id = txHash.toHexString() + suffix;
  let trade = Exchange.load(id);

  if (trade == null) {
    trade = new Exchange(id);
    trade.hash = txHash;
    trade.position = position;
    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.fromVolume = fromVolume;
    trade.toVolume = toVolume;
    trade.opening = opening;
    trade.day = "";
  }

  return trade;
}
