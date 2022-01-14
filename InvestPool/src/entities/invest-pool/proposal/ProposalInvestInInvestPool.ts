import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInvestInInvestPool } from "../../../../generated/schema";

export function getProposalInvestInInvestPool(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalInvestInInvestPool {
  let id = hash.toHex();
  let invest = ProposalInvestInInvestPool.load(id);

  if (invest == null) {
    invest = new ProposalInvestInInvestPool(id);

    invest.amountLP = amountLP;
    invest.amountBase = amountBase;
    invest.investor = investorInfoId;
    invest.day = "";
  }

  return invest;
}
