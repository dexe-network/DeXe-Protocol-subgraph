import { BigInt } from "@graphprotocol/graph-ts";
import { DistributionHistory } from "../../generated/schema";

export function getDistributionHistory(timestamp:BigInt): DistributionHistory {
    let id = timestamp.div(BigInt.fromU32(84600)).toString()
    let distribution = DistributionHistory.load(id);
    if (distribution == null) {
        distribution = new DistributionHistory(id);
    }
    return distribution;
}