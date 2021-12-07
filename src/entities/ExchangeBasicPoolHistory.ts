import { BigInt } from "@graphprotocol/graph-ts";
import { ExchangeBasicPoolHistory } from "../../generated/schema";

export function getExchangeBasicPoolHistory(timestamp: BigInt): ExchangeBasicPoolHistory {
    let id = timestamp.div(BigInt.fromU32(84600));
    let history = ExchangeBasicPoolHistory.load(id.toString());

    if (history == null){
        history = new ExchangeBasicPoolHistory(id.toString());
        history.exchangesCount = BigInt.fromI32(0);
    }

    return history;
}