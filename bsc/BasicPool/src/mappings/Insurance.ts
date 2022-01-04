import { Deposit } from "../../generated/Insurance/Insurance"
import { getInvestorInBasicPool } from "../entities/basic-pool/InvestorInBasicPool"

export function onDeposit(event: Deposit): void {
    let investor = getInvestorInBasicPool(event.params.investor);
    investor.insurance = investor.insurance.plus(event.params.amount);
    investor.save();
}