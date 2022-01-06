import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../InvestTraderPool";

export function getDivestHistoryInInvestPool(
  timestamp: BigInt,
  investPool: Address
): DivestHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = DivestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new DivestHistoryInInvestPool(id.toString());

    history.totalDivestVolume = BigInt.fromI32(0);
    history.investPool = getBasicTraderPool(investPool).id;
  }

  return history;
}
