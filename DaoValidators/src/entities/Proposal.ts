import { BigInt } from "@graphprotocol/graph-ts";
import { DaoPool, Proposal } from "../../generated/schema";

export function getProposal(pool: DaoPool, proposalId: BigInt): Proposal {
  let id = pool.id.concatI32(proposalId.toI32());
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);
    proposal.proposalId = proposalId;
    proposal.totalVote = BigInt.zero();
  }

  return proposal;
}
