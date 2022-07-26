import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { Exchange, TraderPool } from "../../../generated/schema";
import { increaseCounter } from "../../helpers/IncreaseCounter";
import { getInteractionCount } from "../global/InteractionCount";

export function getExchange(
  txHash: Bytes,
  position: string,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  usdVolume: BigInt = BigInt.zero(),
  opening: boolean = false,
  suffix: string = "_0",
  timestamp: BigInt = BigInt.zero()
): Exchange {
  let counter = getInteractionCount(txHash);

  let id = txHash.concatI32(counter.count.toI32()).toHexString() + suffix;
  let trade = Exchange.load(id);

  if (trade == null) {
    trade = new Exchange(id);
    trade.hash = txHash;
    trade.position = position;
    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.fromVolume = fromVolume;
    trade.toVolume = toVolume;
    trade.usdVolume = usdVolume;
    trade.opening = opening;
    trade.day = "";
    trade.timestamp = timestamp;

    increaseCounter(counter);
  }

  return trade;
}
