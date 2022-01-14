import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistoryInBasicPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getExchangeHistoryInBasicPool(timestamp: BigInt, basicPool: Address): ExchangeHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = basicPool.toString() + day.toString();
  let history = ExchangeHistoryInBasicPool.load(id);

  if (history == null) {
    history = new ExchangeHistoryInBasicPool(id);

    history.basicPool = getBasicTraderPool(basicPool).id;
    history.day = day;
  }

  return history;
}
