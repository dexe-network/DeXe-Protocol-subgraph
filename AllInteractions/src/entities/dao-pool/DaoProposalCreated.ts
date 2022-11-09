import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoProposalCreated } from "../../../generated/schema";

export function getDaoProposalCreated(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoProposalCreated {
  let id = hash.concatI32(count.toI32());
  let proposal = DaoProposalCreated.load(id);

  if (proposal == null) {
    proposal = new DaoProposalCreated(id);
    proposal.pool = pool;

    proposal.proposalId = proposalId;

    proposal.transaction = Bytes.empty();
  }

  return proposal;
}
