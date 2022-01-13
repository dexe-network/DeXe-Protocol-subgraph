import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getDivestHistoryInInvestPool(
  timestamp: BigInt,
  investPool: Address
): DivestHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = investPool.toString() + day.toString();
  let history = DivestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new DivestHistoryInInvestPool(id.toString());

    history.totalDivestVolume = BigInt.fromI32(0);
    history.investPool = getInvestTraderPool(investPool).id;
    history.day = day;
  }

  return history;
}
