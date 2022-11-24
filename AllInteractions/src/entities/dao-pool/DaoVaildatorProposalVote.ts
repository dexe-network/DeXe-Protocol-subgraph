import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoVaildatorProposalVote } from "../../../generated/schema";

export function getDaoVaildatorProposalVote(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  amount: BigInt,
  count: BigInt
): DaoVaildatorProposalVote {
  let id = hash.concatI32(count.toI32());
  let proposalVote = DaoVaildatorProposalVote.load(id);

  if (proposalVote == null) {
    proposalVote = new DaoVaildatorProposalVote(id);
    proposalVote.pool = pool;
    proposalVote.proposalId = proposalId;

    proposalVote.amount = amount;

    proposalVote.transaction = Bytes.empty();
  }

  return proposalVote;
}
