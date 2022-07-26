import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalVest } from "../../../../generated/schema";

export function getProposalVest(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  baseAmount: BigInt,
  lp2Amount: BigInt,
  count: BigInt
): ProposalVest {
  let id = hash.concatI32(count.toI32());
  let vest = ProposalVest.load(id);

  if (vest == null) {
    vest = new ProposalVest(id);
    vest.pool = pool;
    vest.proposalId = proposalId;
    vest.baseAmount = baseAmount;
    vest.lp2Amount = lp2Amount;
    vest.transaction = Bytes.empty();
  }

  return vest;
}
