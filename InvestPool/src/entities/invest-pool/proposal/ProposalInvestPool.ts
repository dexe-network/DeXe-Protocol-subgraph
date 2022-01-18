import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeInInvestPool, ProposalInvestPool } from "../../../../generated/schema";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getProposalInvestPool(
  index: BigInt,
  investPool: Address,
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero()
): ProposalInvestPool {
  let id = getInvestTraderPool(investPool).id.toString() + index.toString();
  let proposal = ProposalInvestPool.load(id);

  if (proposal == null) {
    proposal = new ProposalInvestPool(id);

    proposal.investorsCount = BigInt.zero();
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.investPool = getInvestTraderPool(investPool).id;
  }

  return proposal;
}
