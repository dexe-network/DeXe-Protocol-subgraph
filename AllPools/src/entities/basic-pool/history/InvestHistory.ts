import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getInvestHistory(timestamp: BigInt, basicPool: Address): InvestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let poolId = getBasicTraderPool(basicPool).id;
  let id = poolId + day.toString();
  let history = InvestHistory.load(id);

  if (history == null) {
    history = new InvestHistory(id);

    history.totalInvestVolume = BigInt.fromI32(0);
    history.basicPool = poolId;
    history.day = day;
  }

  return history;
}
