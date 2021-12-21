import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestPoolInvestHistory } from "../../generated/schema";

export function getProposalInvestPoolInvestHistory(id:string): ProposalInvestPoolInvestHistory{
    let history = ProposalInvestPoolInvestHistory.load(id);
    if (history == null){
        history = new ProposalInvestPoolInvestHistory(id);
        history.count = BigInt.zero();
    }
    return history;
}
