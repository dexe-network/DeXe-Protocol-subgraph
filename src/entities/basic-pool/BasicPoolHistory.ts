import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolHistory } from "../../../generated/schema";
import { DAY } from "../global/globals";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getBasicPoolHistory(timestamp: BigInt, pool: Address, investors: Array<string>): BasicPoolHistory {
    let id = timestamp.div(BigInt.fromI32(DAY)).toString();
    let history = BasicPoolHistory.load(id);
    if (history == null){
        history = new BasicPoolHistory(id);
        history.pool = getBasicTraderPool(pool).id;
        history.investors = new Array<string>();

        for(let i = 0; i < investors.length; i++){
            history.investors.push(investors[i]);
        }
        
    }
    return history;
}