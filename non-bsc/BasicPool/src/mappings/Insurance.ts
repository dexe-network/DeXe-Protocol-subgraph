import { Deposit, Withdraw, Payout } from "../../generated/Insurance/Insurance"
import { getInvestorInBasicPool } from "../entities/basic-pool/InvestorInBasicPool"

export function onDeposit(event: Deposit): void {
    let investor = getInvestorInBasicPool(event.params.investor);
    investor.insurance = investor.insurance.plus(event.params.amount);
    investor.save();
}

export function onWithdraw(event: Withdraw): void {
    let investor = getInvestorInBasicPool(event.params.investor);
    investor.insurance = investor.insurance.minus(event.params.amount);
    investor.save();
}

export function onPayout(event: Payout): void {
    let investor = getInvestorInBasicPool(event.params.investor);
    investor.insurancePayout = investor.insurancePayout.plus(event.params.amount);
    investor.save();
}