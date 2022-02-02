import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInvest } from "../../../../generated/schema";

export function getProposalInvest(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalInvest {
  let id = hash.toHexString();
  let invest = ProposalInvest.load(id);

  if (invest == null) {
    invest = new ProposalInvest(id);

    invest.amountLP = amountLP;
    invest.amountBase = amountBase;
    invest.investor = investorInfoId;
    invest.day = "";
  }

  return invest;
}
