import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalVest } from "../../../../generated/schema";

export function getProposalVest(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  baseAmount: BigInt,
  lp2Amount: BigInt
): ProposalVest {
  let vest = ProposalVest.load(hash);

  if (vest == null) {
    vest = new ProposalVest(hash);
    vest.pool = pool;
    vest.proposalId = proposalId;
    vest.baseAmount = baseAmount;
    vest.lp2Amount = lp2Amount;
    vest.transaction = Bytes.empty();
  }

  return vest;
}
