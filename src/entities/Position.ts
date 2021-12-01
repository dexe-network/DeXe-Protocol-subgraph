import { Address } from "@graphprotocol/graph-ts";
import { PositionForBasicPool, PositionForInvestPool, PositionForRiskyPool } from "../../generated/schema";

export function getPositionForBasicPool(id: string, pool: string, token1: Address, token2: Address): PositionForBasicPool{
    let position = PositionForBasicPool.load(id)
    if(position == null){
        position = new PositionForBasicPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
    }
    return position;
}

export function getPositionForInvestPool(id: string, pool: string, token1:Address, token2:Address): PositionForInvestPool {
    let position = PositionForInvestPool.load(id)
    if(position == null){
        position = new PositionForInvestPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
    }
    return position;
}

export function getPositionForRiskyPool(id: string, pool: string, token1:Address, token2:Address): PositionForRiskyPool {
    let position = PositionForRiskyPool.load(id)
    if(position == null){
        position = new PositionForRiskyPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
    }
    return position;
}
