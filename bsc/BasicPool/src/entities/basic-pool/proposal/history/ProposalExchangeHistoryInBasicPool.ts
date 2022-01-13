import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeHistoryInBasicPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalExchangeHistoryInBasicPool(
  timestamp: BigInt,
  proposal: string
): ProposalExchangeHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = proposal + day.toString();
  let history = ProposalExchangeHistoryInBasicPool.load(id);

  if (history == null) {
    history = new ProposalExchangeHistoryInBasicPool(id);

    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
