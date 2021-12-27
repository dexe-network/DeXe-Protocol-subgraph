import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeHistoryInBasicPool } from "../../../../../generated/schema";

export function getProposalExchangeHistoryInBasicPool(
  timestamp: BigInt,
  proposal: string
): ProposalExchangeHistoryInBasicPool {
  let id = timestamp.div(BigInt.fromU32(86400));
  let history = ProposalExchangeHistoryInBasicPool.load(id.toString());

  if (history == null) {
    history = new ProposalExchangeHistoryInBasicPool(id.toString());

    history.proposal = proposal;
  }

  return history;
}
