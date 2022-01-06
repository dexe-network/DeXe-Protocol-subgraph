import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../InvestTraderPool";

export function getExchangeHistoryInInvestPool(
  timestamp: BigInt,
  investPool: Address
): ExchangeHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = ExchangeHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new ExchangeHistoryInInvestPool(id.toString());

    history.investPool = getBasicTraderPool(investPool).id;
  }

  return history;
}
