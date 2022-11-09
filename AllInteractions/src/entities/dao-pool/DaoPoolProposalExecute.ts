import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolProposalExecute } from "../../../generated/schema";

export function getDaoPoolProposalExecute(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoPoolProposalExecute {
  let id = hash.concatI32(count.toI32());
  let proposalExecute = DaoPoolProposalExecute.load(id);

  if (proposalExecute == null) {
    proposalExecute = new DaoPoolProposalExecute(id);
    proposalExecute.pool = pool;
    proposalExecute.proposalId = proposalId;

    proposalExecute.transaction = Bytes.empty();
  }

  return proposalExecute;
}
