import { BigInt } from "@graphprotocol/graph-ts";
import { DaoPool, Voter, VoterOffchain } from "../../../generated/schema";

export function getVoterOffchain(voter: Voter, pool: DaoPool): VoterOffchain {
  const id = voter.id.concat(pool.id);
  let voterOffchain = VoterOffchain.load(id);

  if (voterOffchain == null) {
    voterOffchain = new VoterOffchain(id);

    voterOffchain.voter = voter.id;
    voterOffchain.pool = pool.id;

    voterOffchain.rewardUSD = BigInt.zero();
    voterOffchain.claimedRewardUSD = BigInt.zero();
  }

  return voterOffchain;
}
