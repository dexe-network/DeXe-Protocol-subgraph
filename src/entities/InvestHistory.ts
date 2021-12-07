import { BigInt } from "@graphprotocol/graph-ts";
import { InvestHistory} from "../../generated/schema";

export function getInvestHistory(timestamp: BigInt): InvestHistory {
    let id = timestamp.div(BigInt.fromU32(84600));
    let history = InvestHistory.load(id.toString());

    if (history == null) {
        history = new InvestHistory(id.toString());
        history.count = BigInt.fromI32(0);
        history.totalInvestVolume = BigInt.fromI32(0);
        history.newInvestors = BigInt.fromI32(0);
    }

    return history;
}