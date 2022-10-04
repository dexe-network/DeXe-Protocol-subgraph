import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Proposal } from "../../generated/schema";

export function getProposal(
  pool: DaoPool,
  proposalId: BigInt,
  creator: Address = Address.zero(),
  quorum: BigInt = BigInt.zero(),
  executorType: i32 = 0
): Proposal {
  let id = pool.id.concatI32(proposalId.toI32());
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.proposalId = proposalId;
    proposal.creator = creator;
    proposal.executor = Bytes.empty();
    proposal.executionTimestamp = BigInt.zero();
    proposal.currentVotes = BigInt.zero();
    proposal.quorum = quorum;
    proposal.votersVoted = BigInt.zero();
    proposal.proposalType = BigInt.zero();
    proposal.distributionProposal = Bytes.empty();
    proposal.executorType = BigInt.fromI32(executorType);

    proposal.pool = pool.id;
  }

  return proposal;
}
