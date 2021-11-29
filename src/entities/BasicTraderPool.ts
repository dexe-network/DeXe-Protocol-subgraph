import {Address} from "@graphprotocol/graph-ts"

import {BasicTraderPool} from "../../generated/schema"
import { PoolParameters } from "../../generated/schema";
//import { runTests } from "../../tests/BasicTraderPool.test"
export function getBasicPool(address: Address, poolParameters: PoolParameters | null = null): BasicTraderPool {
    let basicPool = BasicTraderPool.load(address.toHex());
    
    if (basicPool == null){   
        basicPool = new BasicTraderPool(address.toHex());
        if (poolParameters != null){
            basicPool.poolParameters = poolParameters.id;
        }else{
            basicPool.poolParameters = "";
        }
        //basicPool.investors = new Array<string>()
    }
    
    return basicPool;
}