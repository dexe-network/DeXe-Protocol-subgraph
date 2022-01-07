import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getBasicTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";

const BASIC_POOL_NAME = "BASIC_POOL";

export function onDeployed(event: Deployed): void {
    if (event.params.poolName == BASIC_POOL_NAME) {
        let pool = getBasicTraderPool(event.params.at, event.params.basicToken, event.params.symbol);
        pool.save();

        let proposal = getProposalContract(event.params.proposalContract);
        proposal.save();
    }
}
