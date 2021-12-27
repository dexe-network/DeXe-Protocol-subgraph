import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolHistory } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getBasicPoolHistory(timestamp: BigInt, pool: Address): BasicPoolHistory {
    let id = timestamp.div(BigInt.fromI32(86400)).toString();
    let history = BasicPoolHistory.load(id);
    if (history == null){
        history = new BasicPoolHistory(id);
        history.investorsCount = BigInt.zero();
        history.pool = getBasicTraderPool(pool).id;
    }
    return history;
}