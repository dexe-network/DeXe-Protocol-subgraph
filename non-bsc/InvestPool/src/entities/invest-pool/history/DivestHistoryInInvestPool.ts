import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistoryInInvestPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getDivestHistoryInInvestPool(
  timestamp: BigInt,
  InvestPool: Address
): DivestHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = DivestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new DivestHistoryInInvestPool(id.toString());

    history.totalDivestVolume = BigInt.fromI32(0);
    history.InvestPool = getInvestTraderPool(InvestPool).id;
  }

  return history;
}
