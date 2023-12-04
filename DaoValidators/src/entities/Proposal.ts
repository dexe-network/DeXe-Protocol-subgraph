import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Proposal } from "../../generated/schema";

export function getProposal(
  pool: DaoPool,
  proposalId: BigInt,
  isInternal: boolean,
  description: string = "",
  quorum: BigInt = BigInt.zero(),
  creator: Bytes = Bytes.empty()
): Proposal {
  let id = pool.id.toHexString() + proposalId.toString() + "_" + (isInternal ? "1" : "0");
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);
    proposal.proposalId = proposalId;
    proposal.isInternal = isInternal;
    proposal.description = description;
    proposal.quorum = quorum;
    proposal.totalVoteFor = BigInt.zero();
    proposal.totalVoteAgainst = BigInt.zero();
    proposal.validatorsVoted = BigInt.zero();
    proposal.executor = Bytes.empty();
    proposal.creator = creator;
  }

  return proposal;
}
