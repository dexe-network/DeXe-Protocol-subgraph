import { BigInt, Address } from "@graphprotocol/graph-ts";
import { TradeInInvestPool } from "../../generated/schema";

export function getTradeInInvestPool(
  txHash: string,
  fromToken: Address,
  toToken: Address,
  volume: BigInt,
  priceInBase: BigInt,
  timestamp: BigInt,
  positionId: string
): TradeInInvestPool {
  let trade = TradeInInvestPool.load(txHash);

  if (trade == null) {
    trade = new TradeInInvestPool(txHash);

    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.volume = volume;
    trade.priceInBase = priceInBase;
    trade.timestamp = timestamp;
    trade.position = positionId;
    trade.day = timestamp.div(BigInt.fromU32(84600)).toString();
  }

  return trade;
}
