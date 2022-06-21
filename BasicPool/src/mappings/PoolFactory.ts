import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { RiskyProposal } from "../../generated/templates";
import { getProposalContract } from "../entities/basic-pool/proposal/ProposalContract";

export function onDeployed(event: TraderPoolDeployed): void {
  if (event.params.poolType == BASIC_POOL_NAME) {
    let pool = getBasicTraderPool(event.params.at, event.params.basicToken);
    pool.save();

    getProposalContract(event.params.proposalContract, pool.id).save();

    RiskyProposal.create(event.params.proposalContract);
  }
}
