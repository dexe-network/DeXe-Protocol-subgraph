import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalVote, VoterInProposal } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getProposalVote(
  hash: Bytes,
  voterInProposal: VoterInProposal,
  timestamp: BigInt,
  personalAmount: BigInt,
  delegatedAmount: BigInt,
  isVoteFor: boolean
): ProposalVote {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let proposalVote = ProposalVote.load(id);

  if (proposalVote == null) {
    proposalVote = new ProposalVote(id);
    proposalVote.hash = hash;
    proposalVote.timestamp = timestamp;

    proposalVote.delegatedAmount = delegatedAmount;
    proposalVote.personalAmount = personalAmount;

    proposalVote.isVoteFor = isVoteFor;

    proposalVote.proposal = voterInProposal.proposal;
    proposalVote.voter = voterInProposal.id;

    increaseCounter(counter);
  }

  return proposalVote;
}
