import { BigInt } from "@graphprotocol/graph-ts";
import { DivestHistory} from "../../generated/schema";

export function getDivestHistory(timestamp: BigInt): DivestHistory {
    let id = timestamp.div(BigInt.fromU32(84600));
    let history = DivestHistory.load(id.toString());

    if (history == null) {
        history = new DivestHistory(id.toString());
        history.count = BigInt.fromI32(0);
        history.totalDivestVolume = BigInt.fromI32(0);
    }

    return history;
}