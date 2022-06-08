import { BigInt } from "@graphprotocol/graph-ts";
import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";
import { InsuranceHistory } from "../../generated/schema";
import { getInsuranceHistory } from "../entities/trader-pool/history/InsuranceHistory";
import { getInvestor } from "../entities/trader-pool/Investor";
import { findPrevHistory } from "../helpers/HistorySearcher";

export function onDeposit(event: Deposited): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  let prevHistory: InsuranceHistory | null;

  if (history.prevHistory == "") {
    prevHistory = findPrevHistory<InsuranceHistory>(InsuranceHistory.load, investor.id, history.day, BigInt.fromI32(1));
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.claimedAmount = prevHistory.claimedAmount;
      history.insurance = prevHistory.insurance;
    } else {
      history.prevHistory = "";
      history.claimedAmount = BigInt.zero();
      history.insurance = BigInt.zero();
    }
  }

  history.insurance = history.insurance.plus(event.params.amount);
  investor.save();
  history.save();
}

export function onWithdraw(event: Withdrawn): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  let prevHistory: InsuranceHistory | null;

  if (history.prevHistory == "") {
    prevHistory = findPrevHistory<InsuranceHistory>(InsuranceHistory.load, investor.id, history.day, BigInt.fromI32(1));
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.claimedAmount = prevHistory.claimedAmount;
      history.insurance = prevHistory.insurance;
    } else {
      history.prevHistory = "";
      history.claimedAmount = BigInt.zero();
      history.insurance = BigInt.zero();
    }
  }

  history.insurance = history.insurance.minus(event.params.amount);
  investor.save();
  history.save();
}

export function onPayout(event: Paidout): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  let prevHistory: InsuranceHistory | null;

  if (history.prevHistory == "") {
    prevHistory = findPrevHistory<InsuranceHistory>(InsuranceHistory.load, investor.id, history.day, BigInt.fromI32(1));
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.claimedAmount = prevHistory.claimedAmount;
      history.insurance = prevHistory.insurance;
    } else {
      history.prevHistory = "";
      history.claimedAmount = BigInt.zero();
      history.insurance = BigInt.zero();
    }
  }

  history.claimedAmount = history.claimedAmount.plus(event.params.amount);
  investor.save();
  history.save();
}
