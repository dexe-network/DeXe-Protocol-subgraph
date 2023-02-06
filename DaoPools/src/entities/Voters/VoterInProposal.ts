import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, VoterInPool, VoterInProposal } from "../../../generated/schema";

export function getVoterInProposal(proposal: Proposal, voterInPool: VoterInPool): VoterInProposal {
  let id = voterInPool.voter.concat(proposal.id);
  let voterInProposal = VoterInProposal.load(id);

  if (voterInProposal == null) {
    voterInProposal = new VoterInProposal(id);
    voterInProposal.pool = voterInPool.pool;
    voterInProposal.proposal = proposal.id;
    voterInProposal.voter = voterInPool.id;

    voterInProposal.totalVoteAmount = BigInt.zero();
    voterInProposal.totalDelegatedVoteAmount = BigInt.zero();

    voterInProposal.claimedReward = BigInt.zero();
    voterInProposal.claimedDpRewardUSD = BigInt.zero();
    voterInProposal.unclaimedReward = BigInt.zero();
    voterInProposal.unclaimedRewardFromDelegations = BigInt.zero();
  }

  return voterInProposal;
}
