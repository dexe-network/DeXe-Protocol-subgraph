import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalWithdrawal } from "../../../../generated/schema";

export function getProposalWithdrawal(
  hash: Bytes,
  amount: BigInt = BigInt.zero(),
  investorInfoId: string = "",
  timestamp: BigInt = BigInt.zero()
): ProposalWithdrawal {
  let id = hash.toHexString();
  let withdraw = ProposalWithdrawal.load(id);

  if (withdraw == null) {
    withdraw = new ProposalWithdrawal(id);
    withdraw.investor = investorInfoId;
    withdraw.amount = amount;
    withdraw.day = "";
    withdraw.timestamp = timestamp;
  }
  return withdraw;
}
