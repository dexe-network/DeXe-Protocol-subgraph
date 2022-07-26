import { InvestorPoolPosition, Vest } from "../../../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { getInteractionCount } from "../global/InteractionCount";

export function getVest(
  hash: Bytes,
  investorPoolPosition: InvestorPoolPosition,
  isInvest: boolean = false,
  volumeBase: BigInt = BigInt.zero(),
  volumeLP: BigInt = BigInt.zero(),
  volumeUSD: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Vest {
  let counter = getInteractionCount(hash);
  let vest = Vest.load(hash.concatI32(counter.count.toI32()));

  if (vest == null) {
    vest = new Vest(hash.concatI32(counter.count.toI32()));
    vest.hash = hash;
    vest.investorPoolPosition = investorPoolPosition.id;
    vest.isInvest = isInvest;
    vest.volumeBase = volumeBase;
    vest.volumeLP = volumeLP;
    vest.volumeUSD = volumeUSD;
    vest.timestamp = timestamp;

    counter.count = counter.count.plus(BigInt.fromI32(1));
    counter.save();
  }

  return vest;
}
