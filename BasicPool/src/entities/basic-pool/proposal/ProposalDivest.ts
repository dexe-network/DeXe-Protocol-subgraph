import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalDivest } from "../../../../generated/schema";
import { getProposalDivestHistory } from "./history/ProposalDivestHistory";
import { getInvestorInfo } from "../InvestorInfo";

export function getProposalDivest(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalDivest {
  let id = hash.toHex();
  let divest = ProposalDivest.load(id);

  if (divest == null) {
    divest = new ProposalDivest(id);

    divest.amountLP = amountLP;
    divest.amountBase = amountBase;
    divest.investor = investorInfoId;
    divest.day = "";
  }

  return divest;
}
