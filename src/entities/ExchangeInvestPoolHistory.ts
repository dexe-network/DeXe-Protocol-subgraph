import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeInvestPoolHistory } from "../../generated/schema";

export function getExchangeInvestPoolHistory(timestamp: BigInt): ExchangeInvestPoolHistory {
    let id = timestamp.div(BigInt.fromU32(84600));
    let history = ExchangeInvestPoolHistory.load(id.toString());

    if (history == null){
        history = new ExchangeInvestPoolHistory(id.toString());
        history.exchangesCount = BigInt.fromI32(0);
    }

    return history;
}