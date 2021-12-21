import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalBasicPoolInvest } from "../../generated/schema";
import { getInvestor } from "./Investor";
import { getProposalBasicPool } from "./ProposalBasicPool";
import { getProposalBasicPoolInvestHistory } from "./ProposalBasicPoolInvestHistory";
export function getProposalBasicPoolInvest(id:string, investors:Address = Address.zero(), timestamp:BigInt = BigInt.zero(), amount:BigInt = BigInt.zero(), proposal:string): ProposalBasicPoolInvest{
    let invest = ProposalBasicPoolInvest.load(id);
    if(invest == null){
        invest = new ProposalBasicPoolInvest(id);
        invest.proposal = proposal;
        invest.investor = getInvestor(investors.toHex()).id
        invest.day = timestamp.div(BigInt.fromU32(84600)).toString();
        invest.amount = amount;
    }
    return invest;
}