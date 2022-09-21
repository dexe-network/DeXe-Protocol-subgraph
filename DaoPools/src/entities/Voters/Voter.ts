import { Address } from "@graphprotocol/graph-ts";
import { Voter } from "../../../generated/schema";

export function getVoter(voterAddress: Address): Voter {
  let voter = Voter.load(voterAddress);

  if (voter == null) {
    voter = new Voter(voterAddress);
  }

  return voter;
}
