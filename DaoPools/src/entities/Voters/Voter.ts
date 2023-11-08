import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Voter } from "../../../generated/schema";

export function getVoter(voterAddress: Address): Voter {
  let voter = Voter.load(voterAddress);

  if (voter == null) {
    voter = new Voter(voterAddress);

    voter.expertNft = Bytes.empty();

    voter.totalProposalsCreated = BigInt.zero();
    voter.totalMicropoolRewardUSD = BigInt.zero();
    voter.totalClaimedUSD = BigInt.zero();
    voter.totalDelegatedUSD = BigInt.zero();
    voter.totalLockedFundsUSD = BigInt.zero();
    voter.totalVotedProposals = BigInt.zero();
    voter.totalVotes = BigInt.zero();
    voter.currentVotesDelegated = BigInt.zero();
    voter.currentVotesReceived = BigInt.zero();
    voter.delegateesCount = BigInt.zero();
    voter.delegatorsCount = BigInt.zero();
  }

  return voter;
}
