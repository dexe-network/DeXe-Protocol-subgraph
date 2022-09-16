import { BigInt } from "@graphprotocol/graph-ts";
import { InvestorPoolPosition, LpHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getLpHistory(
  investorPoolPosition: InvestorPoolPosition,
  timestamp: BigInt,
  currentLpAmount: BigInt = BigInt.zero()
): LpHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = investorPoolPosition.id.toString() + day.toString();
  let history = LpHistory.load(id);

  if (history == null) {
    history = new LpHistory(id);
    history.currentLpAmount = currentLpAmount;

    history.investorPoolPosition = investorPoolPosition.id;
    history.day = day;
  }

  return history;
}
