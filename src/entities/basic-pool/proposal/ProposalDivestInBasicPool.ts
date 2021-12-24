import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalDivestInBasicPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInBasicPool } from "./history/ProposalDivestHistoryInBasicPool";
import { getInvestorBasicPool } from "../InvestorInfo";

export function getProposalDivestInBasicPool(
  id: string,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investor: Address = Address.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalDivestInBasicPool {
  let divest = ProposalDivestInBasicPool.load(id);

  if (divest == null) {
    divest = new ProposalDivestInBasicPool(id);

    divest.amountLP = amountLP;
    divest.amountBase = amountBase;
    divest.investor = getInvestorBasicPool(investor).id;
    divest.day = getProposalDivestHistoryInBasicPool(timestamp).id;
  }

  return divest;
}
