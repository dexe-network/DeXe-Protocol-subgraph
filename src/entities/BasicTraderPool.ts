import {Address} from "@graphprotocol/graph-ts"

import {BasicTraderPool} from "../../generated/schema"
import { PoolParameters } from "../../generated/schema";

export function getBasicPool(address: Address, poolParameters: PoolParameters | null = null): BasicTraderPool {
    let basicPool = BasicTraderPool.load(address.toHex());
    
    if (basicPool == null){   
        basicPool = new BasicTraderPool(address.toHex());
        basicPool.poolParameters = poolParameters?.id || "";
    }
    
    return basicPool;
}