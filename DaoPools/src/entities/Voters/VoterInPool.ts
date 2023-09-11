import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Voter, VoterInPool } from "../../../generated/schema";

export function getVoterInPool(pool: DaoPool, voter: Voter, timestamp: BigInt): VoterInPool {
  let id = voter.id.concat(pool.id);
  let voterInPool = VoterInPool.load(id);

  if (voterInPool == null) {
    voterInPool = new VoterInPool(id);

    voterInPool.joinedTimestamp = timestamp;

    voterInPool.expertNft = Bytes.empty();

    voterInPool.receivedDelegation = BigInt.zero();
    voterInPool.receivedNFTDelegation = new Array<BigInt>();
    voterInPool.receivedNFTDelegationCount = BigInt.zero();

    voterInPool.receivedTreasuryDelegation = BigInt.zero();
    voterInPool.receivedTreasuryNFTDelegation = new Array<BigInt>();
    voterInPool.receivedTreasuryNFTDelegationCount = BigInt.zero();

    voterInPool.totalLockedUSD = BigInt.zero();
    voterInPool.totalClaimedUSD = BigInt.zero();
    voterInPool.rewardedUSD = BigInt.zero();

    voterInPool.engagedProposalsCount = BigInt.zero();
    voterInPool.currentDelegateesCount = BigInt.zero();
    voterInPool.currentDelegatorsCount = BigInt.zero();

    voterInPool.APR = BigInt.zero();
    voterInPool._cusum = BigInt.zero();
    voterInPool._lastUpdate = BigInt.zero();

    voterInPool.pool = pool.id;
    voterInPool.voter = voter.id;

    voterInPool.proposals = new Array<Bytes>();

    pool.votersCount = pool.votersCount.plus(BigInt.fromI32(1));
  }

  return voterInPool;
}
