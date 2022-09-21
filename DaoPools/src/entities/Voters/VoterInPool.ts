import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Voter, VoterInPool } from "../../../generated/schema";

export function getVoterInPool(pool: DaoPool, voter: Voter): VoterInPool {
  let id = voter.id.concat(pool.id);
  let voterInPool = VoterInPool.load(id);

  if (voterInPool == null) {
    voterInPool = new VoterInPool(id);

    voterInPool.receivedDelegation = BigInt.zero();
    voterInPool.totalDPClaimed = BigInt.zero();
    voterInPool.totalClaimedUSD = BigInt.zero();
    voterInPool.claimedDPs = new Array<Bytes>();
    voterInPool.receivedNFTDelegation = new Array<BigInt>();

    voterInPool.pool = pool.id;
    voterInPool.voter = voter.id;

    pool.votersCount = pool.votersCount.plus(BigInt.fromI32(1));
  }

  return voterInPool;
}
