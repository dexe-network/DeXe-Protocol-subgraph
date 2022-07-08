import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalVest } from "../../../../generated/schema";

export function getRiskyProposalVest(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  baseAmount: BigInt,
  lp2Amount: BigInt
): RiskyProposalVest {
  let vest = RiskyProposalVest.load(hash);

  if (vest == null) {
    vest = new RiskyProposalVest(hash);
    vest.pool = pool;
    vest.proposalId = proposalId;
    vest.baseAmount = baseAmount;
    vest.lp2Amount = lp2Amount;
    vest.transaction = Bytes.empty();
  }

  return vest;
}
