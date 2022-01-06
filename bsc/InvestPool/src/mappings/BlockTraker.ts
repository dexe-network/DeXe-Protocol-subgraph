import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getInvestPoolRegistry } from "../entities/invest-pool/InvestPoolRegistry"
import { getBasicTraderPoolById } from "../entities/invest-pool/InvestTraderPool";
import { InvestPool } from "../../generated/templates/InvestPool/InvestPool";
import { getInvestPoolPriceHistory } from "../entities/invest-pool/InvestPoolPriceHistory";

export function depositHandler(call: ethereum.Call): void {
    if (call.block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))){
        let pools = getInvestPoolRegistry().pools;
    
        for(let i =0; i<pools.length;i++) {
            let pool = getBasicTraderPoolById(pools[i]);
            if(pool.id == pools[i]){
                let contract = InvestPool.bind(Address.fromString(pool.id));
                let price = BigInt.zero(); // TODO price
                let totalSupply = contract.totalSupply();
                let priceHistory = getInvestPoolPriceHistory(call.block.timestamp,pool.id,price,totalSupply);
                priceHistory.save();
            }
        }
    }
}