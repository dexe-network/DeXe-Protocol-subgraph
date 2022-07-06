import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalPosition, ProposalVest } from "../../../../generated/schema";

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
  let vest = ProposalVest.load(hash);

  if (vest == null) {
    vest = new ProposalVest(hash);
    vest.isInvest = isInvest;
    vest.baseVolume = volumeBase;
    vest.lpVolume = volumeLP;
    vest.lp2Volume = volumeLP2;
    vest.usdVolume = volumeUSD;
    vest.timestamp = timestamp;
    vest.proposal = proposal.id;
  }

  return vest;
}
