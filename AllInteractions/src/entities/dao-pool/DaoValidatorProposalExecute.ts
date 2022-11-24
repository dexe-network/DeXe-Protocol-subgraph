import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoValidatorProposalExecute } from "../../../generated/schema";

export function getDaoValidatorProposalExecute(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  amount: BigInt,
  count: BigInt
): DaoValidatorProposalExecute {
  let id = hash.concatI32(count.toI32());
  let proposalVote = DaoValidatorProposalExecute.load(id);

  if (proposalVote == null) {
    proposalVote = new DaoValidatorProposalExecute(id);
    proposalVote.pool = pool;
    proposalVote.proposalId = proposalId;

    proposalVote.transaction = Bytes.empty();
  }

  return proposalVote;
}
