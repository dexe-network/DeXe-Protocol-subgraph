import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeToRiskyPool, Investor, PairInvestorRiskyPool, PositionForRiskyPool } from "../../generated/schema";

export function getExchangeToRiskyPool(id: string, investor: Investor, pair: PairInvestorRiskyPool, amount: BigInt, position: PositionForRiskyPool): ExchangeToRiskyPool{
    let exchange = ExchangeToRiskyPool.load(id);
    if(exchange == null){
        exchange = new ExchangeToRiskyPool(id);
        exchange.pair = pair.id;
        exchange.investor = investor.id;
        exchange.amount = amount;
        exchange.position = position.id;
    }

    return exchange;
}