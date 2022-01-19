import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getDivestHistory(timestamp: BigInt, investPool: Address): DivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = investPool.toString() + day.toString();
  let history = DivestHistory.load(id.toString());

  if (history == null) {
    history = new DivestHistory(id.toString());

    history.totalDivestVolume = BigInt.fromI32(0);
    history.investPool = getInvestTraderPool(investPool).id;
    history.day = day;
  }

  return history;
}
