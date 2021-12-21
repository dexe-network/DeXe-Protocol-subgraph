import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestPoolInvest } from "../../generated/schema";
import { getInvestor } from "./Investor";

export function getProposalInvestPoolInvest(id:string, investors:Address = Address.zero(), timestamp:BigInt = BigInt.zero(), amount:BigInt = BigInt.zero(), proposal:string): ProposalInvestPoolInvest{
    let invest = ProposalInvestPoolInvest.load(id);
    if(invest == null){
        invest = new ProposalInvestPoolInvest(id);
        invest.proposal = proposal;
        invest.investor = getInvestor(investors.toHex()).id
        invest.day = timestamp.div(BigInt.fromU32(84600)).toString();
        invest.amount = amount;
    }
    return invest;
}