import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalWithdrawHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalWithdrawHistory(timestamp: BigInt, proposal: string): ProposalWithdrawHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal + day.toString();
  let history = ProposalWithdrawHistory.load(id);

  if (history == null) {
    history = new ProposalWithdrawHistory(id);
    history.totalWithdraw = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }
  return history;
}
