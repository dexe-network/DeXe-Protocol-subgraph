import { Deployed } from '../../generated/TraderPoolFactory/TraderPoolFactory'
import { getBasicPool } from '../entities/BasicTraderPool';
import { getInvestPool } from '../entities/InvestTraderPool';
import { getPoolParameters } from '../entities/PoolParameters';
import { getRiskyPool } from '../entities/RiskyTraderPool';
//import { runTests } from "../../tests/BasicTraderPool.test"
const BASIC_POOL_NAME = "BASIC_POOL";
const RISKY_POOL_NAME = "RISKY_POOL";
const INVEST_POOL_NAME = "INVEST_POOL";

export function onDeployed(event: Deployed): void {
    
    let params = event.params;
    let parameters = getPoolParameters(event.transaction.hash.toHex(), params.poolParameters);
    
    if (parameters == null){
        return
    }

    if (params.poolName == BASIC_POOL_NAME) {
        let pool = getBasicPool(params.at, parameters);

        parameters.save();
        pool.save();
    }else if (params.poolName == RISKY_POOL_NAME){
        let pool = getRiskyPool(params.at, parameters);

        parameters.save();
        pool.save();
    }else if (params.poolName == INVEST_POOL_NAME){
        let pool = getInvestPool(params.at, parameters);

        parameters.save();
        pool.save();
    }else{
        return;
    }
}