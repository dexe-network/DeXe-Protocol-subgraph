import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getExchangeHistoryInInvestPool(
  timestamp: BigInt,
  investPool: Address
): ExchangeHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = investPool.toString() + day.toString();
  let history = ExchangeHistoryInInvestPool.load(id);

  if (history == null) {
    history = new ExchangeHistoryInInvestPool(id);

    history.investPool = getInvestTraderPool(investPool).id;
    history.day = day;
  }

  return history;
}
