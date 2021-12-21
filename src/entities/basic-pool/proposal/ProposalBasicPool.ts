import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPool } from "../../../../generated/schema";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getProposalBasicPool(
  id: string,
  basicPool: Address = Address.zero(),
  token: Address = Address.zero(),
  limits1: BigInt = BigInt.zero(),
  limits2: BigInt = BigInt.zero(),
  limits3: BigInt = BigInt.zero()
): ProposalBasicPool {
  let proposal = ProposalBasicPool.load(id);

  if (proposal == null) {
    proposal = new ProposalBasicPool(id);

    proposal.token = token;
    proposal.investorsCount = BigInt.zero();
    proposal.limit1 = limits1;
    proposal.limit2 = limits2;
    proposal.limit3 = limits3;
    proposal.basicPool = getBasicTraderPool(basicPool).id;
  }

  return proposal;
}
