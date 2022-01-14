import { Deposit, Withdraw, Payout } from "../../generated/Insurance/Insurance";
import { getInvestorInInvestPool } from "../entities/invest-pool/InvestorInInvestPool";

export function onDeposit(event: Deposit): void {
  let investor = getInvestorInInvestPool(event.params.investor);
  investor.insurance = investor.insurance.plus(event.params.amount);
  investor.save();
}

export function onWithdraw(event: Withdraw): void {
  let investor = getInvestorInInvestPool(event.params.investor);
  investor.insurance = investor.insurance.minus(event.params.amount);
  investor.save();
}

export function onPayout(event: Payout): void {
  let investor = getInvestorInInvestPool(event.params.investor);
  investor.insurancePayout = investor.insurancePayout.plus(event.params.amount);
  investor.save();
}
