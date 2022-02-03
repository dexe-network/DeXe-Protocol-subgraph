import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getInvestHistory(timestamp: BigInt, investPool: Address): InvestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let poolId = getInvestTraderPool(investPool).id;
  let id = poolId + day.toString();
  let history = InvestHistory.load(id);

  if (history == null) {
    history = new InvestHistory(id);

    history.totalInvestVolume = BigInt.fromI32(0);
    history.investPool = poolId;
    history.day = day;
  }

  return history;
}
