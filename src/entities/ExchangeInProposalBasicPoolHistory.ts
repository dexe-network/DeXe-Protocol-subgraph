import { ExchangeInProposalBasicPoolHistory } from "../../generated/schema";

export function getExchangeInProposalBasicPoolHistory(id:string): ExchangeInProposalBasicPoolHistory {
    let history = ExchangeInProposalBasicPoolHistory.load(id);
    if (history == null){
        history = new ExchangeInProposalBasicPoolHistory(id);
    }
    return history;
}
