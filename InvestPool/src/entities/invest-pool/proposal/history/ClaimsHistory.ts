import { BigInt } from "@graphprotocol/graph-ts";
import { ClaimsHistory, Proposal } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getClaimsHistory(proposal: Proposal, timestamp: BigInt = BigInt.zero()): ClaimsHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal.id + day.toString();
  let history = ClaimsHistory.load(id);

  if (history == null) {
    history = new ClaimsHistory(id);
    history.proposal = proposal.id;
    history.day = day;
  }

  return history;
}
