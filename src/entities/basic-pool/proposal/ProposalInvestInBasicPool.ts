import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInvestInBasicPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInBasicPool } from "./history/ProposalDivestHistoryInBasicPool";
import { getInvestorInfo } from "../InvestorInfo";

export function getProposalInvestInBasicPool(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investorInfoId: string = ""
): ProposalInvestInBasicPool {
  let id = hash.toHex();
  let invest = ProposalInvestInBasicPool.load(id);

  if (invest == null) {
    invest = new ProposalInvestInBasicPool(id);

    invest.amountLP = amountLP;
    invest.amountBase = amountBase;
    invest.investor = investorInfoId;
    invest.day = "";
  }

  return invest;
}
