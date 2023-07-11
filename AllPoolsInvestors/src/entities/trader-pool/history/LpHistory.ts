import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestorPoolPosition, LpHistory } from "../../../../generated/schema";
import { DAY, MAX_SEARCH_DEPTH } from "../../global/globals";
import { findPrevHistory } from "@dlsl/graph-modules";

export function getLpHistory(investorPoolPosition: InvestorPoolPosition, timestamp: BigInt): LpHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = investorPoolPosition.id.toString() + day.toString();
  let history = LpHistory.load(id);

  if (history == null) {
    history = new LpHistory(id);
    history.currentLpAmount = BigInt.zero();

    history.investorPoolPosition = investorPoolPosition.id;
    history.prevHistory = "";
    history.day = day;
  }

  return history;
}

export function injectPrevLPHistory(history: LpHistory, investorPoolPosition: InvestorPoolPosition): void {
  if (history.prevHistory == "") {
    let prevHistory = findPrevHistory<LpHistory>(
      LpHistory.load,
      investorPoolPosition.id,
      history.day,
      BigInt.fromI32(MAX_SEARCH_DEPTH),
      1
    );
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.currentLpAmount = prevHistory.currentLpAmount;
    }
  }
}
