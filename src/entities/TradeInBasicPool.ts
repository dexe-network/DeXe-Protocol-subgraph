import { BigInt, Address } from "@graphprotocol/graph-ts";
import { TradeInBasicPool } from "../../generated/schema";

export function getTradeInBasicPool(
  txHash: string,
  fromToken: Address,
  toToken: Address,
  volume: BigInt,
  priceInBase: BigInt,
  timestamp: BigInt,
  positionId: string
): TradeInBasicPool {
  let trade = TradeInBasicPool.load(txHash);

  if (trade == null) {
    trade = new TradeInBasicPool(txHash);

    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.volume = volume;
    trade.priceInBase = priceInBase;
    trade.timestamp = timestamp;
    trade.position = positionId;
  }

  return trade;
}
