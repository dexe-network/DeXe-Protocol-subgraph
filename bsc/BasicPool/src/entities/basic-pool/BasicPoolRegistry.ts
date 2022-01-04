import { BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolRegistry } from "../../../generated/schema";

export function getBasicPoolRegistry(): BasicPoolRegistry{
    let id = BigInt.zero().toString();
    let bpr = BasicPoolRegistry.load(id);

    if(bpr == null){
        bpr = new BasicPoolRegistry(id);
        bpr.pools = new Array<string>();
    }
    return bpr;
}