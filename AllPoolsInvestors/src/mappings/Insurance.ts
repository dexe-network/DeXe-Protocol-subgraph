import { BigInt } from "@graphprotocol/graph-ts";
import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";
import { InsuranceHistory, Investor } from "../../generated/schema";
import { getInsuranceHistory } from "../entities/trader-pool/history/InsuranceHistory";
import { getInvestor } from "../entities/trader-pool/Investor";
import { findPrevHistory } from "@dlsl/graph-modules";
import { MAX_SEARCH_DEPTH } from "../entities/global/globals";

export function onDeposit(event: Deposited): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);

  injectPrevHistory(history, investor);

  history.stake = history.stake.plus(event.params.amount);
  investor.save();
  history.save();
}

export function onWithdraw(event: Withdrawn): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);

  injectPrevHistory(history, investor);

  history.stake = history.stake.minus(event.params.amount);
  investor.save();
  history.save();
}

export function onPayout(event: Paidout): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);

  injectPrevHistory(history, investor);

  history.claimedAmount = history.claimedAmount.plus(event.params.insurancePayout);
  history.stake = history.stake.minus(event.params.userStakePayout);

  investor.save();
  history.save();
}

function injectPrevHistory(history: InsuranceHistory, investor: Investor): void {
  let prevHistory: InsuranceHistory | null;
  if (history.prevHistory == "") {
    prevHistory = findPrevHistory<InsuranceHistory>(
      InsuranceHistory.load,
      investor.id.toHexString(),
      history.day,
      BigInt.fromI32(MAX_SEARCH_DEPTH),
      1
    );
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.claimedAmount = prevHistory.claimedAmount;
      history.stake = prevHistory.stake;
    }
  }
}
