import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeToInvestPool, Investor,PairInvestorInvestPool, PositionForInvestPool } from "../../generated/schema";

export function getExchangeToInvestPool(id: string, investor: Investor, pair: PairInvestorInvestPool, amount: BigInt, position: PositionForInvestPool): ExchangeToInvestPool{
    let exchange = ExchangeToInvestPool.load(id);
    if(exchange == null){
        exchange = new ExchangeToInvestPool(id);
        exchange.pair = pair.id;
        exchange.investor = investor.id;
        exchange.amount = amount;
        exchange.position = position.id;
    }

    return exchange;
}