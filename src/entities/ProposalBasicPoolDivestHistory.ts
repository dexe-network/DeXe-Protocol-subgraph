import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestPoolDivestHistory } from "../../generated/schema";

export function getProposalBasicPoolDivestHistory(id:string): ProposalInvestPoolDivestHistory{
    let history = ProposalInvestPoolDivestHistory.load(id);
    if (history == null){
        history = new ProposalInvestPoolDivestHistory(id);
        history.count = BigInt.zero();
    }
    return history;
}