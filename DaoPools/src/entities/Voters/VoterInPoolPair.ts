import { BigInt } from "@graphprotocol/graph-ts";
import { VoterInPool, VoterInPoolPair } from "../../../generated/schema";

export function getVoterInPoolPair(from: VoterInPool, to: VoterInPool): VoterInPoolPair {
  let id = from.pool.concat(from.voter).concat(to.voter);
  let pair = VoterInPoolPair.load(id);

  if (pair == null) {
    pair = new VoterInPoolPair(id);

    pair.delegator = from.id;
    pair.delegatee = to.id;

    pair.delegatedAmount = BigInt.zero();
    pair.delegatedUSD = BigInt.zero();
    pair.delegatedNfts = new Array<BigInt>();
  }

  return pair;
}
