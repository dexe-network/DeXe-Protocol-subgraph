import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalWithdraw } from "../../../../generated/schema";

export function getProposalWithdraw(
  hash: Bytes,
  amount: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalWithdraw {
  let id = hash.toHex();
  let withdraw = ProposalWithdraw.load(id);

  if (withdraw == null) {
    withdraw = new ProposalWithdraw(id);
    withdraw.investor = investorInfoId;
    withdraw.amount = amount;
    withdraw.day = "";
  }
  return withdraw;
}
