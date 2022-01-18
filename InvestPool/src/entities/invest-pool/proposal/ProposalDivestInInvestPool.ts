import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalDivestInInvestPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInInvestPool } from "./history/ProposalDivestHistoryInInvestPool";
import { getInvestorInfo } from "../InvestorInfo";

export function getProposalDivestInInvestPool(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalDivestInInvestPool {
  let id = hash.toHex();
  let divest = ProposalDivestInInvestPool.load(id);

  if (divest == null) {
    divest = new ProposalDivestInInvestPool(id);

    divest.amount = amountLP;
    divest.investor = investorInfoId;
    divest.day = "";
  }

  return divest;
}
