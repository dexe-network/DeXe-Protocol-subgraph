import { BigInt } from "@graphprotocol/graph-ts";
import { SuppliesHistory, Proposal } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getSuppliesHistory(proposal: Proposal, timestamp: BigInt = BigInt.zero()): SuppliesHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal.id + day.toString();
  let history = SuppliesHistory.load(id);

  if (history == null) {
    history = new SuppliesHistory(id);
    history.proposal = proposal.id;
    history.day = day;
  }

  return history;
}
