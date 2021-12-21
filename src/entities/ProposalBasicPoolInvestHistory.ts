import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPoolInvestHistory } from "../../generated/schema";

export function getProposalBasicPoolInvestHistory(id:string): ProposalBasicPoolInvestHistory{
    let history = ProposalBasicPoolInvestHistory.load(id);
    if (history == null){
        history = new ProposalBasicPoolInvestHistory(id);
        history.count = BigInt.zero();
    }
    return history;
}
