import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestPool } from "../../generated/schema";
import { getInvestTraderPool } from "./InvestTraderPool";

export function getProposalInvestPool(id: string,pool:Address = Address.zero(),token:Address = Address.zero(),limits1:BigInt = BigInt.zero(), limits2:BigInt = BigInt.zero()): ProposalInvestPool{
    let proposal = ProposalInvestPool.load(id);
    if(proposal == null){
        proposal = new ProposalInvestPool(id);
        proposal.pool = getInvestTraderPool(pool).id;
        proposal.investors = BigInt.zero();
        proposal.token = token;
        proposal.limit1 = limits1;
        proposal.limit2 = limits2;
    }
    return proposal;
}