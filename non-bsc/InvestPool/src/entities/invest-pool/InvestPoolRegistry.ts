import { BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolRegistry } from "../../../generated/schema";

export function getInvestPoolRegistry(): InvestPoolRegistry{
    let id = BigInt.zero().toString();
    let bpr = InvestPoolRegistry.load(id);

    if(bpr == null){
        bpr = new InvestPoolRegistry(id);
        bpr.pools = new Array<string>();
    }
    return bpr;
}