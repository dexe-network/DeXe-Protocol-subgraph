import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getExchangeHistory(timestamp: BigInt, basicPool: string): ExchangeHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = basicPool + day.toString();
  let history = ExchangeHistory.load(id);

  if (history == null) {
    history = new ExchangeHistory(id);

    history.basicPool = basicPool;
    history.day = day;
  }

  return history;
}
