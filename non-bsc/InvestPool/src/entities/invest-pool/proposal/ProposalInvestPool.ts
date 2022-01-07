import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestPool } from "../../../../generated/schema";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getProposalInvestPool(
  index: BigInt,
  InvestPool: Address,
  token: Address = Address.zero(),
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero(),
  maxTokenPriceLimit: BigInt = BigInt.zero()
): ProposalInvestPool {
  let id = getInvestTraderPool(InvestPool).id.toString() + index.toString();
  let proposal = ProposalInvestPool.load(id);

  if (proposal == null) {
    proposal = new ProposalInvestPool(id);

    proposal.token = token;
    proposal.investorsCount = BigInt.zero();
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.maxTokenPriceLimit = maxTokenPriceLimit;
    proposal.InvestPool = getInvestTraderPool(InvestPool).id;
  }

  return proposal;
}
