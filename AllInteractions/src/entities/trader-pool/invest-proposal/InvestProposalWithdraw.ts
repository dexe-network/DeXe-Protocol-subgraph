import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalWithdraw } from "../../../../generated/schema";

export function getInvestProposalWithdraw(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  amount: BigInt
): InvestProposalWithdraw {
  let withdraw = InvestProposalWithdraw.load(hash);

  if (withdraw == null) {
    withdraw = new InvestProposalWithdraw(hash);

    withdraw.pool = pool;
    withdraw.proposalId = proposalId;
    withdraw.amount = amount;
  }

  return withdraw;
}
