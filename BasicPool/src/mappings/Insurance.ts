import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";
import { getInvestorInBasicPool } from "../entities/basic-pool/InvestorInBasicPool";

export function onDeposit(event: Deposited): void {
  let investor = getInvestorInBasicPool(event.params.investor);
  investor.insurance = investor.insurance.plus(event.params.amount);
  investor.save();
}

export function onWithdraw(event: Withdrawn): void {
  let investor = getInvestorInBasicPool(event.params.investor);
  investor.insurance = investor.insurance.minus(event.params.amount);
  investor.save();
}

export function onPayout(event: Paidout): void {
  let investor = getInvestorInBasicPool(event.params.investor);
  investor.insurancePayout = investor.insurancePayout.plus(event.params.amount);
  investor.save();
}
