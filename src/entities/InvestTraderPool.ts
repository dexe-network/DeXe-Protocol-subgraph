import {Address} from "@graphprotocol/graph-ts"

import {InvestTraderPool} from "../../generated/schema"
import { PoolParameters } from "../../generated/schema";
import { runTests } from "../../tests/BasicTraderPool.test"
export function getInvestPool(address: Address, poolParameters: PoolParameters | null = null): InvestTraderPool {
    let investPool = InvestTraderPool.load(address.toHex());
    
    if (investPool == null){   
        investPool = new InvestTraderPool(address.toHex());
        investPool.poolParameters = poolParameters != null ? poolParameters.id : null;
    }
    
    return investPool as InvestTraderPool;
}