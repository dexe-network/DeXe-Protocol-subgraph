import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getBasicPoolRegistry } from "../entities/basic-pool/BasicPoolRegistry"
import { getBasicTraderPool, getBasicTraderPoolById } from "../entities/basic-pool/BasicTraderPool";
import { BasicPool } from "../../generated/templates/BasicPool/BasicPool";
import { getBasicPoolPriceHistory } from "../entities/basic-pool/BasicPoolPriceHistory";

export function depositHandler(call: ethereum.Call): void {
    if (call.block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))){
        let pools = getBasicPoolRegistry().pools;
    
        for(let i =0; i<pools.length;i++) {
            let pool = getBasicTraderPoolById(pools[i]);
            if(pool.id == pools[i]){
                let contract = BasicPool.bind(Address.fromString(pool.id));
                let price = BigInt.zero(); // TODO price
                let totalSupply = contract.totalSupply();
                let priceHistory = getBasicPoolPriceHistory(call.block.timestamp,pool.id,price,totalSupply);
                priceHistory.save();
            }
        }
    }
}