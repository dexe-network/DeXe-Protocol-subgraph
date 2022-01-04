import { BigInt } from "@graphprotocol/graph-ts";
import { InvestorLPHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";

export function getInvestorLPHistory(timestamp: BigInt, ivestorInfoId: string): InvestorLPHistory {
    let id = timestamp.div(BigInt.fromI32(DAY)).toString();
    let history = InvestorLPHistory.load(id);

    if (history == null){
        history = new InvestorLPHistory(id);
        history.lpBalance = BigInt.zero();
        history.investorInfo = ivestorInfoId;
    }

    return history;
}