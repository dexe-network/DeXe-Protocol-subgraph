import { BigInt } from "@graphprotocol/graph-ts";
import { Distribution } from "../../generated/schema";

export function getDistribution(id:string,proposal:string="",amount:BigInt = BigInt.zero(), timestamp:BigInt = BigInt.zero()): Distribution {
    let distribution = Distribution.load(id);
    if (distribution == null) {
        distribution = new Distribution(id);
        distribution.proposal = proposal;
        distribution.amount = amount;
        distribution.day = timestamp.div(BigInt.fromU32(84600)).toString();
    }
    return distribution;
}