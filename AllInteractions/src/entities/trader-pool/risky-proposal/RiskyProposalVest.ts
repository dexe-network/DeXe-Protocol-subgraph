import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalVest } from "../../../../generated/schema";

export function getRiskyProposalVest(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  baseAmount: BigInt,
  lp2Amount: BigInt
): RiskyProposalVest {
  let id = hash.toHexString();
  let vest = RiskyProposalVest.load(id);

  if (vest == null) {
    vest = new RiskyProposalVest(id);
    vest.pool = pool;
    vest.proposalId = proposalId;
    vest.baseAmount = baseAmount;
    vest.lp2Amount = lp2Amount;
    vest.transaction = "";
  }

  return vest;
}
