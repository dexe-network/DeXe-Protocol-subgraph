import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalWithdrawal } from "../../../../generated/schema";

export function getProposalWithdrawal(
  hash: Bytes,
  amount: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalWithdrawal {
  let id = hash.toHex();
  let withdraw = ProposalWithdrawal.load(id);

  if (withdraw == null) {
    withdraw = new ProposalWithdrawal(id);
    withdraw.investor = investorInfoId;
    withdraw.amount = amount;
    withdraw.day = "";
  }
  return withdraw;
}
