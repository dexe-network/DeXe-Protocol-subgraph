import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { RiskyProposal, TraderPool } from "../../generated/templates";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { getProposalContract } from "../entities/trader-pool/proposal/RiskyProposalContract";

export function onDeployed(event: TraderPoolDeployed): void {
  let pool = getTraderPool(
    event.params.at,
    event.params.poolType,
    event.params.basicToken,
    event.block.timestamp,
    event.block.number
  );
  pool.save();

  TraderPool.create(event.params.at);

  if (event.params.poolType == BASIC_POOL_NAME) {
    RiskyProposal.create(event.params.proposalContract);
    getProposalContract(event.params.proposalContract, event.params.at).save();
  }
}
