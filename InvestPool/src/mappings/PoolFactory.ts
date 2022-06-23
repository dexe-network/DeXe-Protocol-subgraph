import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { INVEST_POOL_NAME } from "../entities/global/globals";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { InvestProposal } from "../../generated/templates";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";

export function onDeployed(event: TraderPoolDeployed): void {
  if (event.params.poolType == INVEST_POOL_NAME) {
    let pool = getInvestTraderPool(event.params.at, event.params.basicToken);
    pool.save();

    getProposalContract(event.params.proposalContract, pool.id).save();

    InvestProposal.create(event.params.proposalContract);
  }
}
