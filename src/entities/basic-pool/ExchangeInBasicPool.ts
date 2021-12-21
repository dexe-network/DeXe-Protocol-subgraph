import { BigInt, Address } from "@graphprotocol/graph-ts";
import { ExchangeInBasicPool } from "../../../generated/schema";
import { getPositionInBasicPool } from "./PositionInBasicPool";
import { getExchangeHistoryInBasicPool } from "./history/ExchangeHistoryInBasicPool";

export function getExchangeInBasicPool(
  txHash: string,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero(),
  positionId: string = ""
): ExchangeInBasicPool {
  let trade = ExchangeInBasicPool.load(txHash);

  if (trade == null) {
    trade = new ExchangeInBasicPool(txHash);

    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.fromVolume = fromVolume;
    trade.toVolume = toVolume;
    trade.position = getPositionInBasicPool(positionId).id;
    trade.day = getExchangeHistoryInBasicPool(timestamp).id;
  }

  return trade;
}
