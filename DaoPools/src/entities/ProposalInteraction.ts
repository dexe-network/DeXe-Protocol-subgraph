import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInteraction, VoterInProposal } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getProposalInteraction(
  hash: Bytes,
  voterInProposal: VoterInProposal,
  timestamp: BigInt,
  interactionType: BigInt,
  totalVote: BigInt
): ProposalInteraction {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let proposalVote = ProposalInteraction.load(id);

  if (proposalVote == null) {
    proposalVote = new ProposalInteraction(id);
    proposalVote.hash = hash;
    proposalVote.timestamp = timestamp;

    proposalVote.interactionType = interactionType;
    proposalVote.totalVote = totalVote;

    proposalVote.proposal = voterInProposal.proposal;
    proposalVote.voter = voterInProposal.id;

    increaseCounter(counter);
  }

  return proposalVote;
}
