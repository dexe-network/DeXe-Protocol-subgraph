import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getBasicPoolHistory(timestamp: BigInt, pool: Address, investors: Array<string>): InvestPoolHistory {
    let day = timestamp.div(BigInt.fromI32(DAY));
    let id = pool.toString() + day.toString();
    let history = InvestPoolHistory.load(id);
    if (history == null){
        history = new InvestPoolHistory(id);
        history.pool = getInvestTraderPool(pool).id;
        history.investors = new Array<string>();
        history.day = day;
        
        for(let i = 0; i < investors.length; i++){
            history.investors.push(investors[i]);
        }
        
    }
    return history;
}