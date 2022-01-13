import { BigInt } from "@graphprotocol/graph-ts";
import { InvestorLPHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getInvestorLPHistory(timestamp: BigInt, investorInfoId: string): InvestorLPHistory {
    let day = timestamp.div(BigInt.fromI32(DAY)); 
    let id = investorInfoId + day.toString();
    let history = InvestorLPHistory.load(id);

    if (history == null){
        history = new InvestorLPHistory(id);
        history.lpBalance = BigInt.zero();
        history.investorInfo = investorInfoId;
        history.day = day;
    }

    return history;
}