import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoValidatorProposalCreate } from "../../../generated/schema";

export function getDaoValidatorProposalCreate(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoValidatorProposalCreate {
  let id = hash.concatI32(count.toI32());
  let proposalCreate = DaoValidatorProposalCreate.load(id);

  if (proposalCreate == null) {
    proposalCreate = new DaoValidatorProposalCreate(id);
    proposalCreate.pool = pool;
    proposalCreate.proposalId = proposalId;

    proposalCreate.transaction = Bytes.empty();
  }

  return proposalCreate;
}
