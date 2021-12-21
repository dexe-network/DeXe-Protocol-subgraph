import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPoolDivest, ProposalInvestPoolDivestHistory } from "../../generated/schema";
import { getInvestor } from "./Investor";

export function getProposalBasicPoolDivest(id:string, investor:Address = Address.zero(), timestamp:BigInt = BigInt.zero(), amount:BigInt = BigInt.zero()): ProposalBasicPoolDivest {
    let divest = ProposalBasicPoolDivest.load(id);
    if(divest == null){
        divest = new ProposalBasicPoolDivest(id);
        divest.investor = getInvestor(investor.toHex()).id;
        divest.day = timestamp.div(BigInt.fromU32(846000)).toString();
        divest.amount = amount;
    }
    return divest;
}