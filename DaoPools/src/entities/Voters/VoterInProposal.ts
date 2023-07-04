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

    voterInProposal.totalVoteForAmount = BigInt.zero();
    voterInProposal.totalVoteAgainstAmount = BigInt.zero();
    voterInProposal.totalDelegatedVoteForAmount = BigInt.zero();
    voterInProposal.totalDelegatedVoteAgainstAmount = BigInt.zero();

    voterInProposal.claimedRewardUSD = BigInt.zero();
    voterInProposal.claimedDpRewardUSD = BigInt.zero();
    voterInProposal.unclaimedRewardUSD = BigInt.zero();
    voterInProposal.unclaimedRewardFromDelegationsUSD = BigInt.zero();
  }

  return voterInProposal;
}
