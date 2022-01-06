import { Deposit } from "../../generated/Insurance/Insurance"
import { getInvestorInInvestPool } from "../entities/invest-pool/InvestorInInvestPool"

export function onDeposit(event: Deposit): void {
    let investor = getInvestorInInvestPool(event.params.investor);
    investor.insurance = investor.insurance.plus(event.params.amount);
    investor.save();
}