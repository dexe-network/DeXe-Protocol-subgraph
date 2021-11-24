import {Address} from "@graphprotocol/graph-ts"

import {RiskyTraderPool} from "../../generated/schema"
import { PoolParameters } from "../../generated/schema";
import { DeployedPoolParametersStruct } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { runTests } from "../../tests/BasicTraderPool.test"
export function getRiskyPool(address: Address, poolParameters: PoolParameters | null = null): RiskyTraderPool {
    let riskyPool = RiskyTraderPool.load(address.toHex());
    
    if (riskyPool == null){   
        riskyPool = new RiskyTraderPool(address.toHex());
        riskyPool.poolParameters = poolParameters != null ? poolParameters.id : " ";
    }
    
    return riskyPool;
}