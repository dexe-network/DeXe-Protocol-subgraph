import { Paidout } from "../../generated/Insurance/Insurance";
import { getInvestor } from "../entities/trader-pool/Investor";

export function onPayout(event: Paidout): void {
  let investor = getInvestor(event.params.investor);
  investor.claimedAmount = investor.claimedAmount.plus(event.params.insurancePayout);
  investor.save();
}
