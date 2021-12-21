import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ExchangeInProposalBasicPool } from "../../generated/schema";


export function getExchangeInProposalBasicPool(id:string, from:Address = Address.zero(), to:Address = Address.zero(), amount:BigInt = BigInt.zero(), proposal: string = "", investor: Address = Address.zero(), timestamp: BigInt = BigInt.zero()): ExchangeInProposalBasicPool {
    let exchange = ExchangeInProposalBasicPool.load(id);
    if (exchange == null){
        exchange = new ExchangeInProposalBasicPool(id);
        exchange.from = from;
        exchange.to = to;
        exchange.amount = amount;
        exchange.proposal = proposal;
        exchange.investor = investor.toString();
        exchange.day = timestamp.div(BigInt.fromU32(84600)).toString();
    }
    return exchange;
}