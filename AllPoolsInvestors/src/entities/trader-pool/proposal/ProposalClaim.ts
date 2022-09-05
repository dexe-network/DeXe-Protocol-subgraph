import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalClaim, ProposalPosition } from "../../../../generated/schema";
import { increaseCounter } from "../../../helpers/IncreaseCounter";
import { getInteractionCount } from "../../global/InteractionCount";

export function getProposalClaim(
  hash: Bytes,
  proposal: ProposalPosition,
  dividendsTokens: Array<Bytes> = new Array<Bytes>(),
  amountDividendsTokens: Array<BigInt> = new Array<BigInt>(),
  timestamp: BigInt = BigInt.zero()
): ProposalClaim {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let claim = ProposalClaim.load(id);

  if (claim == null) {
    claim = new ProposalClaim(id);
    claim.hash = hash;
    claim.timestamp = timestamp;
    claim.proposal = proposal.id;
    claim.dividendsTokens = dividendsTokens;
    claim.amountDividendsTokens = amountDividendsTokens;

    increaseCounter(counter);
  }

  return claim;
}
