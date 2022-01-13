import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getBasicPoolPriceHistory } from "../entities/basic-pool/BasicPoolPriceHistory";
import { TraderPoolRegistry } from "../../generated/TraderPoolRegistry/TraderPoolRegistry"
import { POOL_OFFSET, POOL_REGISTRY_ADDRESS } from "../entities/global/globals";

export function depositHandler(call: ethereum.Call): void {
    if (call.block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))){

        let tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
        let poolCount = tprPrototype.countPools(tprPrototype.BASIC_POOL_NAME());
        let iters = Math.ceil(F64.parseFloat(poolCount.toI64().toString()) / POOL_OFFSET);

        for(let i = 0; i < iters; i++){
            let poolInfo = tprPrototype.listPoolsWithInfo(tprPrototype.BASIC_POOL_NAME(), BigInt.fromI32(POOL_OFFSET*i), BigInt.fromI32((i+1)*POOL_OFFSET));
            
            for(let pool = 0; pool < poolInfo.value0.length; pool++){
                let basicPool = getBasicTraderPool(poolInfo.value0[pool]);
                let history = getBasicPoolPriceHistory(call.block.timestamp, basicPool.id, poolInfo.value1[pool].totalPoolUSD, poolInfo.value1[pool].lpEmission);
                history.save();
            }
        }
    }
}