import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeToBasicPool, Investor, PairInvestorBasicPool, PositionForBasicPool } from "../../generated/schema";

export function getExchangeToBasicPool(id: string, investor: Investor, pair: PairInvestorBasicPool, amount: BigInt, position: PositionForBasicPool): ExchangeToBasicPool{
    let exchange = ExchangeToBasicPool.load(id);
    if(exchange == null){
        exchange = new ExchangeToBasicPool(id);
        exchange.pair = pair.id;
        exchange.investor = investor.id;
        exchange.amount = amount;
        exchange.position = position.id;
    }

    return exchange;
}