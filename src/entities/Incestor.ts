import { Address } from "@graphprotocol/graph-ts";
import { Investor } from "../../generated/schema";

export function getInvestor(address: Address): Investor{
    let investor = Investor.load(address.toHex());
    if(investor == null){
        investor = new Investor(address.toHex());
    }

    return investor;
}