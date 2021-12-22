import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { ExchangeInBasicPool } from "../../../generated/schema";
import { getPositionInBasicPool } from "./PositionInBasicPool";
import { getExchangeHistoryInBasicPool } from "./history/ExchangeHistoryInBasicPool";

export function getExchangeInBasicPool(
  txHash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  positionId: string = ""
): ExchangeInBasicPool {
  let id = txHash.toHex();
  let trade = ExchangeInBasicPool.load(id);

  if (trade == null) {
    trade = new ExchangeInBasicPool(id);

    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.fromVolume = fromVolume;
    trade.toVolume = toVolume;
    trade.position = getPositionInBasicPool(positionId).id;
    trade.day = "";
  }

  return trade;
}
