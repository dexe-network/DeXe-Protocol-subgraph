import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoValidatorProposalVote } from "../../../generated/schema";

export function getDaoVaildatorProposalVote(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  amount: BigInt,
  count: BigInt
): DaoValidatorProposalVote {
  let id = hash.concatI32(count.toI32());
  let proposalVote = DaoValidatorProposalVote.load(id);

  if (proposalVote == null) {
    proposalVote = new DaoValidatorProposalVote(id);
    proposalVote.pool = pool;
    proposalVote.proposalId = proposalId;

    proposalVote.amount = amount;

    proposalVote.transaction = Bytes.empty();
  }

  return proposalVote;
}