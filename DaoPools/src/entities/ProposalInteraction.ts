import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInteraction, VoterInProposal } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getProposalInteraction(
  hash: Bytes,
  voterInProposal: VoterInProposal,
  timestamp: BigInt,
  interactionType: BigInt,
  personalVote: BigInt,
  micropoolVote: BigInt,
  treasuryVote: BigInt
): ProposalInteraction {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let proposalVote = ProposalInteraction.load(id);

  if (proposalVote == null) {
    proposalVote = new ProposalInteraction(id);
    proposalVote.hash = hash;
    proposalVote.timestamp = timestamp;

    proposalVote.interactionType = interactionType;
    proposalVote.personalVote = personalVote;
    proposalVote.micropoolVote = micropoolVote;
    proposalVote.treasuryVote = treasuryVote;

    proposalVote.proposal = voterInProposal.proposal;
    proposalVote.voter = voterInProposal.id;

    increaseCounter(counter);
  }

  return proposalVote;
}
