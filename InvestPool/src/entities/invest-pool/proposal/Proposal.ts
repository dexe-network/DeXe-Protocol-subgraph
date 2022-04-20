import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Proposal } from "../../../../generated/schema";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getProposal(
  index: BigInt,
  investPool: Address,
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero()
): Proposal {
  let id = getInvestTraderPool(investPool).id + index.toString();
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.investPool = getInvestTraderPool(investPool).id;
  }

  return proposal;
}
