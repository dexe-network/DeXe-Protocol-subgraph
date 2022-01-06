import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolHistory } from "../../../generated/schema";
import { DAY } from "../global/globals";
import { getBasicTraderPool } from "./InvestTraderPool";

export function getInvestPoolHistory(timestamp: BigInt, pool: Address, investors: Array<string>): InvestPoolHistory {
    let id = timestamp.div(BigInt.fromI32(DAY)).toString();
    let history = InvestPoolHistory.load(id);
    if (history == null){
        history = new InvestPoolHistory(id);
        history.pool = getBasicTraderPool(pool).id;
        history.investors = new Array<string>();

        for(let i = 0; i < investors.length; i++){
            history.investors.push(investors[i]);
        }
        
    }
    return history;
}