import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getDivestHistory(timestamp: BigInt, investPool: Address): DivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let poolId = getInvestTraderPool(investPool).id;
  let id = poolId + day.toString();
  let history = DivestHistory.load(id);

  if (history == null) {
    history = new DivestHistory(id);

    history.totalDivestVolume = BigInt.zero();
    history.investPool = poolId;
    history.day = day;
  }

  return history;
}
