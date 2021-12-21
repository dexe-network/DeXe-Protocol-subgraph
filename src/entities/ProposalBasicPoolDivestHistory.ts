import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPoolDivestHistory } from "../../generated/schema";

export function getProposalBasicPoolDivestHistory(id:string): ProposalBasicPoolDivestHistory{
    let history = ProposalBasicPoolDivestHistory.load(id);
    if (history == null){
        history = new ProposalBasicPoolDivestHistory(id);
        history.count = BigInt.zero();
    }
    return history;
}