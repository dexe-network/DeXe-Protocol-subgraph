import { BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolPriceHistory } from "../../../generated/schema";
import { MILLIS } from "../global/globals";

export function getInvestPoolPriceHistory(timestamp:BigInt, pool: string, price:BigInt, supply: BigInt): InvestPoolPriceHistory{
    let id = timestamp.div(BigInt.fromI32(MILLIS)).toString();
    let history = InvestPoolPriceHistory.load(id);
    if(history == null){
        history = new InvestPoolPriceHistory(id);
        history.pool = pool;
        history.price = price;
        history.supply = supply;
    }
    return history;
}