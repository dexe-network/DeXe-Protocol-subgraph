import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestInBasicPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInBasicPool } from "./history/ProposalDivestHistoryInBasicPool";
import { getInvestorBasicPool } from "../InvestorBasicPool";

export function getProposalInvestInBasicPool(
  id: string,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investor: Address = Address.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalInvestInBasicPool {
  let invest = ProposalInvestInBasicPool.load(id);

  if (invest == null) {
    invest = new ProposalInvestInBasicPool(id);

    invest.amountLP = amountLP;
    invest.amountBase = amountBase;
    invest.investor = getInvestorBasicPool(investor).id;
    invest.day = getProposalDivestHistoryInBasicPool(timestamp).id;
  }

  return invest;
}
