import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { LastSupply, Proposal } from "../../../../generated/schema";

export function getLastSupply(proposal: Proposal): LastSupply {
  let supply = LastSupply.load(proposal.id);

  if (supply == null) {
    supply = new LastSupply(proposal.id);
    supply.dividendsTokens = new Array<Bytes>();
    supply.amountDividendsTokens = new Array<BigInt>();
    supply.timestamp = BigInt.zero();
  }

  return supply;
}
