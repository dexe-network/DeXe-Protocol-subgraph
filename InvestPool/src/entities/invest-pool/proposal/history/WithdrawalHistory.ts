import { BigInt } from "@graphprotocol/graph-ts";
import { WithdrawalHistory, Proposal } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getWithdrawHistory(proposal: Proposal, timestamp: BigInt = BigInt.zero()): WithdrawalHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal.id + day.toString();
  let history = WithdrawalHistory.load(id);

  if (history == null) {
    history = new WithdrawalHistory(id);
    history.proposal = proposal.id;
    history.day = day;
  }

  return history;
}
