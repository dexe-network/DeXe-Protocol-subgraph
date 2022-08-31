import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Claim } from "../../../../generated/schema";
import { increaseCounter } from "../../../helpers/IncreaseCounter";
import { getInteractionCount } from "../../global/InteractionCount";

export function getClaim(
  hash: Bytes,
  claimTokens: Array<Bytes> = new Array<Bytes>(),
  amountClaimTokens: Array<BigInt> = new Array<BigInt>(),
  timestamp: BigInt = BigInt.zero()
): Claim {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let claim = Claim.load(id);

  if (claim == null) {
    claim = new Claim(id);
    claim.claimTokens = claimTokens;
    claim.amountClaimTokens = amountClaimTokens;
    claim.timestamp = timestamp;

    increaseCounter(counter);
  }

  return claim;
}
