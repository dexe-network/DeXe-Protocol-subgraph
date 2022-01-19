import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalWithdrawalHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalWithdrawalHistory(timestamp: BigInt, proposal: string): ProposalWithdrawalHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal + day.toString();
  let history = ProposalWithdrawalHistory.load(id);

  if (history == null) {
    history = new ProposalWithdrawalHistory(id);
    history.totalWithdrawal = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }
  return history;
}
