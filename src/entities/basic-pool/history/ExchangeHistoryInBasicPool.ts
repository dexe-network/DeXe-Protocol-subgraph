import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistoryInBasicPool } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getExchangeHistoryInBasicPool(
  timestamp: BigInt,
  basicPool: Address = Address.zero()
): ExchangeHistoryInBasicPool {
  let id = timestamp.div(BigInt.fromU32(86400));
  let history = ExchangeHistoryInBasicPool.load(id.toString());

  if (history == null) {
    history = new ExchangeHistoryInBasicPool(id.toString());

    history.basicPool = getBasicTraderPool(basicPool).id;
  }

  return history;
}
