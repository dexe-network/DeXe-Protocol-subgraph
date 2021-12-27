import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolPriceHistory } from "../../../generated/schema";
import { getBasicTraderPool, getBasicTraderPoolById } from "./BasicTraderPool";

export function getBasicPoolPriceHistory(timestamp:BigInt, pool: string, price:BigInt, supply: BigInt): BasicPoolPriceHistory{
    let id = timestamp.div(BigInt.fromI32(1000)).toString();
    let history = BasicPoolPriceHistory.load(id);
    if(history == null){
        history = new BasicPoolPriceHistory(id);
        history.pool = pool;
        history.price = price;
        history.supply = supply;
    }
    return history;
}