import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Voter } from "../../../generated/schema";

export function getVoter(voterAddress: Address): Voter {
  let voter = Voter.load(voterAddress);

  if (voter == null) {
    voter = new Voter(voterAddress);

    voter.expertNft = Bytes.empty();

    voter.totalProposalsCreated = BigInt.zero();
    voter.totalClaimedUSD = BigInt.zero();
    voter.totalRewardedUSD = BigInt.zero();
    voter.totalDelegatedUSD = BigInt.zero();
    voter.totalLockedFundsUSD = BigInt.zero();
    voter.totalVotedProposals = BigInt.zero();
    voter.totalVotes = BigInt.zero();
    voter.delegatorsCount = BigInt.zero();
  }

  return voter;
}
