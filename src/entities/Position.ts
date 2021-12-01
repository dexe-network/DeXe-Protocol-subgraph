import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionForBasicPool, PositionForInvestPool, PositionForRiskyPool } from "../../generated/schema";

export function getPositionForBasicPool(pool: string, token1: Address, token2: Address): PositionForBasicPool{
    let move = getLastPositionIndexForBasicPool(pool, token1,token2);
    let position = getPositionForBasicPoolByIndex(pool, token1, token2, move);
    return position;
}

export function getPositionForBasicPoolByIndex(pool: string, token1: Address, token2: Address, move: BigInt): PositionForBasicPool{
    let id = pool + token1.toHex() + token2.toHex();
    let position = PositionForBasicPool.load(id+move.toString());

    if(position == null){
        position = new PositionForBasicPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
        position.positionNumber = BigInt.fromI32(0);
    }

    return position;
}

export function getLastPositionIndexForBasicPool(pool: string, token1: Address, token2: Address): BigInt {
    let move = getPositionForBasicPoolByIndex(pool, token1, token2, BigInt.fromI32(0)).positionNumber;
    return move;
}

export function getPositionForInvestPool(pool: string, token1:Address, token2:Address): PositionForInvestPool {
    let move = getLastPositionIndexForInvestPool(pool, token1,token2);
    let position = getPositionForInvestPoolByIndex(pool, token1, token2, move);
    return position;
}

export function getPositionForInvestPoolByIndex(pool: string, token1: Address, token2: Address, move: BigInt): PositionForInvestPool{
    let id = pool + token1.toHex() + token2.toHex();
    let position = PositionForInvestPool.load(id+move.toString());

    if(position == null){
        position = new PositionForInvestPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
        position.positionNumber = BigInt.fromI32(0);
    }

    return position;
}

export function getLastPositionIndexForInvestPool(pool: string, token1: Address, token2: Address): BigInt {
    let move = getPositionForInvestPoolByIndex(pool, token1, token2, BigInt.fromI32(0)).positionNumber;
    return move;
}

export function getPositionForRiskyPool(pool: string, token1:Address, token2:Address): PositionForRiskyPool {
    let move = getLastPositionIndexForRiskyPool(pool, token1,token2);
    let position = getPositionForRiskyPoolByIndex(pool, token1, token2, move);
    return position;
}

export function getPositionForRiskyPoolByIndex(pool: string, token1: Address, token2: Address, move: BigInt): PositionForRiskyPool{
    let id = pool + token1.toHex() + token2.toHex();
    let position = PositionForRiskyPool.load(id+move.toString());

    if(position == null){
        position = new PositionForRiskyPool(id);
        position.pool = pool;
        position.token1 = token1;
        position.token2 = token2;
        position.positionNumber = BigInt.fromI32(0);
    }

    return position;
}

export function getLastPositionIndexForRiskyPool(pool: string, token1: Address, token2: Address): BigInt {
    let move = getPositionForRiskyPoolByIndex(pool, token1, token2, BigInt.fromI32(0)).positionNumber;
    return move;
}
