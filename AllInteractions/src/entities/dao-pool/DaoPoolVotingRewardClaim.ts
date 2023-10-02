import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolVotingRewardClaim } from "../../../generated/schema";

export function getDaoPoolVotingRewardClaim(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoPoolVotingRewardClaim {
  let id = hash.concatI32(count.toI32());
  let claimed = DaoPoolVotingRewardClaim.load(id);

  if (claimed == null) {
    claimed = new DaoPoolVotingRewardClaim(id);
    claimed.pool = pool;
    claimed.proposalId = proposalId;

    claimed.transaction = Bytes.empty();
  }

  return claimed;
}
