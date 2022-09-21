import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalVote, ValidatorInProposal } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getProposalVote(
  hash: Bytes,
  timestamp: BigInt,
  proposalId: BigInt,
  amount: BigInt,
  voter: ValidatorInProposal
): ProposalVote {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let vote = ProposalVote.load(id);

  if (vote == null) {
    vote = new ProposalVote(id);
    vote.hash = hash;
    vote.timestamp = timestamp;
    vote.proposalId = proposalId;
    vote.amount = amount;

    vote.voter = voter.id;

    increaseCounter(counter);
  }

  return vote;
}
