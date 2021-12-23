import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalInvestInBasicPool } from "../../../../generated/schema";
import { getProposalDivestHistoryInBasicPool } from "./history/ProposalDivestHistoryInBasicPool";
import { getInvestorBasicPool } from "../InvestorBasicPool";

export function getProposalInvestInBasicPool(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  amountBase: BigInt = BigInt.zero(),
  investor: Address = Address.zero()
): ProposalInvestInBasicPool {
  let id = hash.toHex();
  let invest = ProposalInvestInBasicPool.load(id);

  if (invest == null) {
    invest = new ProposalInvestInBasicPool(id);

    invest.amountLP = amountLP;
    invest.amountBase = amountBase;
    invest.investor = getInvestorBasicPool(investor).id;
    invest.day = "";
  }

  return invest;
}
