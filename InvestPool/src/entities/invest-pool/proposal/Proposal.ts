import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Proposal, ProposalContract } from "../../../../generated/schema";

export function getProposal(
  index: BigInt,
  proposalContract: ProposalContract,
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero()
): Proposal {
  let id = proposalContract.id.toHexString() + index.toString();
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.investPool = proposalContract.investPool;
    proposal.lastSupply = Bytes.empty();
    proposal.lastWithdraw = Bytes.empty();

    proposal.leftTokens = new Array<Bytes>();
    proposal.leftAmounts = new Array<BigInt>();

    proposal.totalUSDSupply = BigInt.zero();
    proposal.firstSupplyTimestamp = BigInt.zero();
    proposal.APR = BigInt.zero();
  }

  return proposal;
}
