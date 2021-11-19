import { Deployed } from '../../generated/TraderPoolFactory/TraderPoolFactory'
import { getBasicPool } from '../entities/BasicTraderPool';
import { getInvestPool } from '../entities/InvestTraderPool';
import { getPoolParameters } from '../entities/PoolParameters';
import { getRiskyPool } from '../entities/RiskyTraderPool';

const BASIC_POOL_NAME = "BASIC_POOL";
const RISKY_POOL_NAME = "RISKY_POOL";
const INVEST_POOL_NAME = "INVEST_POOL";

export function onDeployed(event: Deployed): void {
    let pool;
    let params = event.params;
    let parameters = getPoolParameters(event.transaction.hash.toHex(), params.poolParameters);
    
    if (parameters == null){
        return
    }

    switch (params.poolName) {
        case BASIC_POOL_NAME:
            pool = getBasicPool(params.at, parameters);
            break;
        
        case RISKY_POOL_NAME:
            pool = getRiskyPool(params.at, parameters);
            break;

        case INVEST_POOL_NAME:
            pool = getInvestPool(params.at, parameters);
            break;
        
        default:
            return
    }

    pool.investors = new Array<string>();

    parameters.save()
    pool.save();
}