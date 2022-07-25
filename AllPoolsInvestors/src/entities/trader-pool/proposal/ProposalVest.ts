import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalPosition, ProposalVest } from "../../../../generated/schema";
import { getInteractionCount } from "../../global/InteractionCount";

export function getProposalVest(
  hash: Bytes,
  proposal: ProposalPosition,
  isInvest: boolean = false,
  volumeBase: BigInt = BigInt.zero(),
  volumeLP: BigInt = BigInt.zero(),
  volumeLP2: BigInt = BigInt.zero(),
  volumeUSD: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalVest {
  let counter = getInteractionCount(hash);
  let vest = ProposalVest.load(hash.concatI32(counter.count.toI32()));

  if (vest == null) {
    vest = new ProposalVest(hash.concatI32(counter.count.toI32()));
    vest.isInvest = isInvest;
    vest.baseVolume = volumeBase;
    vest.lpVolume = volumeLP;
    vest.lp2Volume = volumeLP2;
    vest.usdVolume = volumeUSD;
    vest.timestamp = timestamp;
    vest.proposal = proposal.id;

    counter.count = counter.count.plus(BigInt.fromI32(1));
    counter.save();
  }

  return vest;
}
