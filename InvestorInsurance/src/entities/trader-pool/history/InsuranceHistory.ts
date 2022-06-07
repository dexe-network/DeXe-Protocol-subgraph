import { BigInt } from "@graphprotocol/graph-ts";
import { InsuranceHistory, Investor, TraderPool } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getInsuranceHistory(investor: Investor, timestamp: BigInt): InsuranceHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = investor.id + day.toString();
  let history = InsuranceHistory.load(id);

  if (history == null) {
    history = new InsuranceHistory(id);
    history.insurance = investor.insurance;
    history.claimedAmount = investor.claimedAmount;
    history.investor = investor.id;
    history.day = day;
  }

  return history;
}
