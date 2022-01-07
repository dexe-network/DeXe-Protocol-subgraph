import { Swap } from "../../generated/templates/Pair/Pair"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getInvestPoolRegistry } from "../entities/invest-pool/InvestPoolRegistry"
import { getInvestTraderPoolById } from "../entities/invest-pool/InvestTraderPool";
import { InvestPool } from "../../generated/templates/InvestPool/InvestPool";
import { getInvestPoolPriceHistory } from "../entities/invest-pool/InvestPoolPriceHistory";

export function handleSwap(event: Swap): void {
    if (event.block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))){
        let pools = getInvestPoolRegistry().pools;
    
        for(let i =0; i<pools.length;i++) {
            let pool = getInvestTraderPoolById(pools[i]);
            if(pool.id == pools[i]){
                let contract = InvestPool.bind(Address.fromString(pool.id));
                let price = BigInt.zero(); // TODO price
                let totalSupply = contract.totalSupply();
                let priceHistory = getInvestPoolPriceHistory(event.block.timestamp,pool.id,price,totalSupply);
                priceHistory.save();
            }
        }
    }
}