import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../generated/schema";

export function getInvestor(id: string): Investor {
    let investor = Investor.load(id);
    if (investor == null){
        investor = new Investor(id);
        investor.totalDivest = BigInt.fromI32(0);
        investor.totalInvest = BigInt.fromI32(0);
    }
    return investor;
}