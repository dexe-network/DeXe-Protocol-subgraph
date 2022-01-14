import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { ExchangeInInvestPool } from "../../../generated/schema";

export function getExchangeInInvestPool(
  txHash: Bytes,
  positionId: string,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero()
): ExchangeInInvestPool {
  let id = txHash.toHex();
  let trade = ExchangeInInvestPool.load(id);

  if (trade == null) {
    trade = new ExchangeInInvestPool(id);

    trade.fromToken = fromToken;
    trade.toToken = toToken;
    trade.fromVolume = fromVolume;
    trade.toVolume = toVolume;
    trade.position = positionId;
    trade.day = "";
  }

  return trade;
}
