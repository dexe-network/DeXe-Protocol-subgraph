import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolVote } from "../../../generated/schema";

export function getDaoPoolVote(
  hash: Bytes,
  pool: Address,
  amount: BigInt,
  count: BigInt,
  isVoteFor: boolean
): DaoPoolVote {
  let id = hash.concatI32(count.toI32());
  let daoPoolVote = DaoPoolVote.load(id);

  if (daoPoolVote == null) {
    daoPoolVote = new DaoPoolVote(id);
    daoPoolVote.pool = pool;
    daoPoolVote.amount = amount;
    daoPoolVote.isVoteFor = isVoteFor;

    daoPoolVote.transaction = Bytes.empty();
  }

  return daoPoolVote;
}
