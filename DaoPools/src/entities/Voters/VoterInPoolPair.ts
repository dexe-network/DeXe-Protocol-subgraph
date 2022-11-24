import { BigInt } from "@graphprotocol/graph-ts";
import { VoterInPool, VoterInPoolPair } from "../../../generated/schema";

export function getVoterInPoolPair(from: VoterInPool, to: VoterInPool): VoterInPoolPair {
  let id = from.pool.concat(from.voter).concat(to.voter);
  let pair = VoterInPoolPair.load(id);

  if (pair == null) {
    pair = new VoterInPoolPair(id);

    pair.from = from.id;
    pair.to = to.id;

    pair.delegateAmount = BigInt.zero();
    pair.delegateNfts = new Array<BigInt>();
  }

  return pair;
}
