import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Proposal, ProposalInteraction, ValidatorInProposal } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getProposalInteraction(
  hash: Bytes,
  timestamp: BigInt,
  proposal: Proposal,
  amount: BigInt,
  voter: ValidatorInProposal,
  interactionType: BigInt
): ProposalInteraction {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let vote = ProposalInteraction.load(id);

  if (vote == null) {
    vote = new ProposalInteraction(id);
    vote.hash = hash;
    vote.timestamp = timestamp;
    vote.proposal = proposal.id;
    vote.amount = amount;

    vote.voter = voter.id;

    vote.interactionType = interactionType;

    increaseCounter(counter);
  }

  return vote;
}
