import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Proposal, TraderPool } from "../../generated/templates";
import {
  BASIC_POOL_NAME,
  INVEST_POOL_NAME,
  INVEST_PROPOSAL_NAME,
  RISKY_PROPOSAL_NAME,
} from "../entities/global/globals";
import { getProposalContract } from "../entities/trader-pool/proposal/ProposalContract";

export function onDeployed(event: TraderPoolDeployed): void {
  let pool = getTraderPool(
    event.params.at,
    event.params.proposalContract,
    event.params.poolType,
    event.params.basicToken
  );
  pool.save();

  if (event.params.poolType == BASIC_POOL_NAME) {
    getProposalContract(event.params.proposalContract, event.params.at, RISKY_PROPOSAL_NAME).save();
  } else if (event.params.poolType == INVEST_POOL_NAME) {
    getProposalContract(event.params.proposalContract, event.params.at, INVEST_PROPOSAL_NAME).save();
  }

  TraderPool.create(event.params.at);
  Proposal.create(event.params.proposalContract);
}
