import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, VoterInPool, VoterInProposal } from "../../../generated/schema";

export function getVoterInProposal(proposal: Proposal, voterInPool: VoterInPool): VoterInProposal {
  let id = voterInPool.voter.concat(proposal.id);
  let voterInProposal = VoterInProposal.load(id);

  if (voterInProposal == null) {
    voterInProposal = new VoterInProposal(id);

    voterInProposal.isVoteFor = false;

    voterInProposal.totalVote = BigInt.zero();

    voterInProposal.staticRewardUSD = BigInt.zero();
    voterInProposal.votingRewardUSD = BigInt.zero();

    voterInProposal.micropoolRewardUSD = BigInt.zero();

    voterInProposal.claimedRewardUSD = BigInt.zero();

    voterInProposal.pool = voterInPool.pool;
    voterInProposal.proposal = proposal.id;
    voterInProposal.voter = voterInPool.id;
  }

  return voterInProposal;
}
