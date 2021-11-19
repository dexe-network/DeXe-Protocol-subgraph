import {Address} from "@graphprotocol/graph-ts"

import {InvestTraderPool} from "../../generated/schema"
import { PoolParameters } from "../../generated/schema";

export function getInvestPool(address: Address, poolParameters: PoolParameters | null = null): InvestTraderPool {
    let investPool = InvestTraderPool.load(address.toHex());
    
    if (investPool == null){   
        investPool = new InvestTraderPool(address.toHex());
        investPool.poolParameters = poolParameters?.id || "";
    }
    
    return investPool as InvestTraderPool;
}