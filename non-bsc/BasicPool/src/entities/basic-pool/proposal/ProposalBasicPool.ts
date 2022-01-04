import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPool } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getProposalBasicPool(
  index: BigInt,
  basicPool: Address,
  token: Address = Address.zero(),
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero(),
  maxTokenPriceLimit: BigInt = BigInt.zero()
): ProposalBasicPool {
  let id = getBasicTraderPool(basicPool).id.toString() + index.toString();
  let proposal = ProposalBasicPool.load(id);

  if (proposal == null) {
    proposal = new ProposalBasicPool(id);

    proposal.token = token;
    proposal.investorsCount = BigInt.zero();
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.maxTokenPriceLimit = maxTokenPriceLimit;
    proposal.basicPool = getBasicTraderPool(basicPool).id;
  }

  return proposal;
}
