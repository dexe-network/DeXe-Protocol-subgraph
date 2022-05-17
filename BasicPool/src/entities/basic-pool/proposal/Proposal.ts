import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Proposal } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getProposal(
  index: BigInt,
  basicPool: Address,
  token: Address = Address.zero(),
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero(),
  maxTokenPriceLimit: BigInt = BigInt.zero()
): Proposal {
  let id = getBasicTraderPool(basicPool).id + index.toString();
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.token = token;
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.maxTokenPriceLimit = maxTokenPriceLimit;
    proposal.basicPool = getBasicTraderPool(basicPool).id;
    proposal.totalBaseOpenVolume = BigInt.zero();
    proposal.totalBaseCloseVolume = BigInt.zero();
    proposal.totalUSDOpenVolume = BigInt.zero();
    proposal.totalUSDCloseVolume = BigInt.zero();
    proposal.totalPositionOpenVolume = BigInt.zero();
    proposal.totalPositionCloseVolume = BigInt.zero();
  }

  return proposal;
}
