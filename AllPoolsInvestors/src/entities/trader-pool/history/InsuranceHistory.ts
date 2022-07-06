import { BigInt } from "@graphprotocol/graph-ts";
import { InsuranceHistory, Investor } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getInsuranceHistory(investor: Investor, timestamp: BigInt): InsuranceHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = investor.id.toHexString() + day.toString();
  let history = InsuranceHistory.load(id);

  if (history == null) {
    history = new InsuranceHistory(id);
    history.stake = BigInt.zero();
    history.claimedAmount = BigInt.zero();
    history.investor = investor.id;
    history.day = day;
    history.prevHistory = "";
  }

  return history;
}
