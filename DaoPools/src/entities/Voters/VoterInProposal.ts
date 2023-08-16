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

    voterInProposal.totalTreasuryVoteForAmount = BigInt.zero();
    voterInProposal.totalTreasuryVoteAgainstAmount = BigInt.zero();

    voterInProposal.claimedRewardUSD = BigInt.zero();
    voterInProposal.claimedDpRewardUSD = BigInt.zero();
    voterInProposal.unclaimedRewardUSDFor = BigInt.zero();
    voterInProposal.unclaimedRewardUSDAgainst = BigInt.zero();
    voterInProposal.unclaimedRewardFromDelegationsUSDFor = BigInt.zero();
    voterInProposal.unclaimedRewardFromDelegationsUSDAgainst = BigInt.zero();
  }

  return voterInProposal;
}
