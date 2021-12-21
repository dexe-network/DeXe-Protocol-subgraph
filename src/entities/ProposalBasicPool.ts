import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPool } from "../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getProposalBasicPool(id: string, token:Address = Address.zero(), limits1: BigInt = BigInt.zero(), limits2: BigInt = BigInt.zero(), limits3: BigInt = BigInt.zero(), pool:Address = Address.zero()): ProposalBasicPool{
    let proposal = ProposalBasicPool.load(id);

    if(proposal == null){
        proposal = new ProposalBasicPool(id);

        proposal.token = token;
        proposal.limit1 = limits1;
        proposal.limit2 = limits2;
        proposal.limit3 = limits3;
        proposal.pool = getBasicTraderPool(pool).id;
        proposal.investors = BigInt.zero();
    }

    return proposal;
}