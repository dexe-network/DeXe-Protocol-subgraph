import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getExchangeHistoryInInvestPool(
  timestamp: BigInt,
  InvestPool: Address
): ExchangeHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = ExchangeHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new ExchangeHistoryInInvestPool(id.toString());

    history.InvestPool = getInvestTraderPool(InvestPool).id;
  }

  return history;
}
