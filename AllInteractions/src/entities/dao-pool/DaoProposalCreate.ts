import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoProposalCreate } from "../../../generated/schema";

export function getDaoProposalCreate(hash: Bytes, pool: Address, proposalId: BigInt, count: BigInt): DaoProposalCreate {
  let id = hash.concatI32(count.toI32());
  let proposal = DaoProposalCreate.load(id);

  if (proposal == null) {
    proposal = new DaoProposalCreate(id);
    proposal.pool = pool;

    proposal.proposalId = proposalId;

    proposal.transaction = Bytes.empty();
  }

  return proposal;
}
