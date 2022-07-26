import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalWithdraw } from "../../../../generated/schema";

export function getInvestProposalWithdraw(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  amount: BigInt,
  count: BigInt
): InvestProposalWithdraw {
  let id = hash.concatI32(count.toI32());
  let withdraw = InvestProposalWithdraw.load(id);

  if (withdraw == null) {
    withdraw = new InvestProposalWithdraw(id);

    withdraw.pool = pool;
    withdraw.proposalId = proposalId;
    withdraw.amount = amount;
  }

  return withdraw;
}
