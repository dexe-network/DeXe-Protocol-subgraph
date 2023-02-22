import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Voter, VoterInPool } from "../../../generated/schema";

export function getVoterInPool(pool: DaoPool, voter: Voter, timestamp: BigInt): VoterInPool {
  let id = voter.id.concat(pool.id);
  let voterInPool = VoterInPool.load(id);

  if (voterInPool == null) {
    voterInPool = new VoterInPool(id);

    voterInPool.joinedTimestamp = timestamp;

    voterInPool.receivedDelegation = BigInt.zero();
    voterInPool.totalDPClaimed = BigInt.zero();
    voterInPool.totalClaimedUSD = BigInt.zero();
    voterInPool.claimedDPs = new Array<Bytes>();
    voterInPool.receivedNFTDelegation = new Array<BigInt>();
    voterInPool.receivedNFTDelegationCount = BigInt.zero();

    voterInPool.currentDelegatorsCount = BigInt.zero();

    voterInPool.pool = pool.id;
    voterInPool.voter = voter.id;

    voterInPool.APR = BigInt.zero();
    voterInPool.cusum = BigInt.zero();
    voterInPool.lastUpdate = BigInt.zero();

    voterInPool.totalCreditedRewardsUSD = BigInt.zero();
    voterInPool.totalLockedFundsUSD = BigInt.zero();

    pool.votersCount = pool.votersCount.plus(BigInt.fromI32(1));
  }

  return voterInPool;
}
