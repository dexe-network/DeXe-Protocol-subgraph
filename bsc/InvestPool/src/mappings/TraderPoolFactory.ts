import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { INVEST_POOL_NAME } from "../entities/global/globals";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";

export function onDeployed(event: Deployed): void {
    if (event.params.poolName == INVEST_POOL_NAME) {
        let pool = getInvestTraderPool(event.params.at, event.params.basicToken, event.params.symbol);
        pool.save();

        let proposal = getProposalContract(event.params.proposalContract);
        proposal.save();
    }
}
