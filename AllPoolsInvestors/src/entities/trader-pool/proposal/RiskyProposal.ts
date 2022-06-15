import { Address, BigInt } from "@graphprotocol/graph-ts";
import { RiskyProposal, RiskyProposalContract } from "../../../../generated/schema";

export function getRiskyProposal(
  index: BigInt,
  proposalContract: RiskyProposalContract,
  token: Address = Address.zero(),
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero(),
  maxTokenPriceLimit: BigInt = BigInt.zero()
): RiskyProposal {
  let id = proposalContract.id + index.toString();
  let proposal = RiskyProposal.load(id);

  if (proposal == null) {
    proposal = new RiskyProposal(id);

    proposal.token = token;
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.maxTokenPriceLimit = maxTokenPriceLimit;
    proposal.proposalContract = proposalContract.id;
    proposal.totalBaseOpenVolume = BigInt.zero();
    proposal.totalBaseCloseVolume = BigInt.zero();
    proposal.totalUSDOpenVolume = BigInt.zero();
    proposal.totalUSDCloseVolume = BigInt.zero();
    proposal.totalPositionOpenVolume = BigInt.zero();
    proposal.totalPositionCloseVolume = BigInt.zero();
  }

  return proposal;
}
