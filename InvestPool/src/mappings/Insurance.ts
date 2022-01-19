import { Deposited, Withdrawn, Paidout } from "../../generated/Insurance/Insurance";
import { getInvestor } from "../entities/invest-pool/Investor";

export function onDeposit(event: Deposited): void {
  let investor = getInvestor(event.params.investor);
  investor.insurance = investor.insurance.plus(event.params.amount);
  investor.save();
}

export function onWithdraw(event: Withdrawn): void {
  let investor = getInvestor(event.params.investor);
  investor.insurance = investor.insurance.minus(event.params.amount);
  investor.save();
}

export function onPayout(event: Paidout): void {
  let investor = getInvestor(event.params.investor);
  investor.insurancePayout = investor.insurancePayout.plus(event.params.amount);
  investor.save();
}
