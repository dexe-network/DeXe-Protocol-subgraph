import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investment } from "../../generated/schema";


export function getInvestment(id: string, investor: Address = Address.zero(), volume: BigInt = BigInt.fromI32(0), lpPurchasePrice: BigInt = BigInt.fromI32(0), timestamp: BigInt = BigInt.fromI32(0)): Investment {
    let invest = Investment.load(id);
    
    if (invest == null) {
        invest = new Investment(id);
        invest.investor = investor;
        invest.volume = volume;
        invest.lpPurchasePrice = lpPurchasePrice;
        invest.day = timestamp.div(BigInt.fromU32(84600)).toString();
    }

    return invest;
}