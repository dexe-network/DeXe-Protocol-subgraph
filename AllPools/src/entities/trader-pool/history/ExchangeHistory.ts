import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getExchangeHistory(timestamp: BigInt, traderPool: string): ExchangeHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = traderPool + day.toString();
  let history = ExchangeHistory.load(id);

  if (history == null) {
    history = new ExchangeHistory(id);

    history.traderPool = traderPool;
    history.day = day;
  }

  return history;
}
