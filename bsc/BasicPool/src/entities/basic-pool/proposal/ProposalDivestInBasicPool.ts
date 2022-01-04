import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalDivestInBasicPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInBasicPool } from "./history/ProposalDivestHistoryInBasicPool";
import { getInvestorInfo } from "../InvestorInfo";

export function getProposalDivestInBasicPool(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investorInfoId: string = "",
): ProposalDivestInBasicPool {
  let id = hash.toHex();
  let divest = ProposalDivestInBasicPool.load(id);

  if (divest == null) {
    divest = new ProposalDivestInBasicPool(id);

    divest.amountLP = amountLP;
    divest.amountBase = amountBase;
    divest.investor = investorInfoId;
    divest.day = "";
  }

  return divest;
}
