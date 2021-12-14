import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Divestment } from "../../generated/schema";


export function getDivestment(id: string, investor: Address = Address.zero(), volume: BigInt = BigInt.fromI32(0), timestamp: BigInt = BigInt.fromI32(0)): Divestment {
    let divest = Divestment.load(id);
    
    if (divest == null) {
        divest = new Divestment(id);
        divest.investor = investor.toHex();
        divest.volume = volume;
        divest.day = timestamp.div(BigInt.fromU32(84600)).toString();
    }

    return divest;
}