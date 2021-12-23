import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestHistoryInBasicPool } from "../../../../../generated/schema";
import { getProposalBasicPool } from "../ProposalBasicPool";

export function getProposalInvestHistoryInBasicPool(
  timestamp: BigInt,
  proposal: string
): ProposalInvestHistoryInBasicPool {
  let id = timestamp.div(BigInt.fromU32(86400));
  let history = ProposalInvestHistoryInBasicPool.load(id.toString());

  if (history == null) {
    history = new ProposalInvestHistoryInBasicPool(id.toString());

    history.totalInvestVolumeLP = BigInt.zero();
    history.totalInvestVolumeBase = BigInt.zero();
    history.proposal = proposal;
  }

  return history;
}
