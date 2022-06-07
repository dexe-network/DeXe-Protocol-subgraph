import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";
import { getInsuranceHistory } from "../entities/trader-pool/history/InsuranceHistory";
import { getInvestor } from "../entities/trader-pool/Investor";

export function onDeposit(event: Deposited): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  investor.insurance = investor.insurance.plus(event.params.amount);
  history.insurance = history.insurance.plus(event.params.amount);
  investor.save();
  history.save();
}

export function onWithdraw(event: Withdrawn): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  investor.insurance = investor.insurance.minus(event.params.amount);
  history.insurance = history.insurance.minus(event.params.amount);
  investor.save();
  history.save();
}

export function onPayout(event: Paidout): void {
  let investor = getInvestor(event.params.investor);
  let history = getInsuranceHistory(investor, event.block.timestamp);
  investor.claimedAmount = investor.claimedAmount.plus(event.params.amount);
  history.claimedAmount = investor.claimedAmount.plus(event.params.amount);
  investor.save();
  history.save();
}
