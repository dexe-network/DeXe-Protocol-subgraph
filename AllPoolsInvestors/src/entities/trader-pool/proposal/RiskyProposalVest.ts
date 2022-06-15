import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposal, RiskyProposalVest } from "../../../../generated/schema";

export function getRiskyProposalVest(
  hash: Bytes,
  proposal: RiskyProposal,
  isInvest: boolean = false,
  volumeBase: BigInt = BigInt.zero(),
  volumeLP: BigInt = BigInt.zero(),
  volumeUSD: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): RiskyProposalVest {
  let vest = RiskyProposalVest.load(hash.toHexString());

  if (vest == null) {
    vest = new RiskyProposalVest(hash.toHexString());
    vest.isInvest = isInvest;
    vest.baseVolume = volumeBase;
    vest.lpVolume = volumeLP;
    vest.usdVolume = volumeUSD;
    vest.timestamp = timestamp;
    vest.proposal = proposal.id;
  }

  return vest;
}
