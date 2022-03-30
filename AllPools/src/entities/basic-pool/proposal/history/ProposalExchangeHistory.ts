import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalExchangeHistory(timestamp: BigInt, proposal: string): ProposalExchangeHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = proposal + day.toString();
  let history = ProposalExchangeHistory.load(id);

  if (history == null) {
    history = new ProposalExchangeHistory(id);

    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
