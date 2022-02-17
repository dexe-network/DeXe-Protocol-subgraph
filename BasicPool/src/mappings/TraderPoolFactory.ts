import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getProposalContract } from "../entities/basic-pool/proposal/ProposalContract";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { BasicPool, RiskyProposal } from "../../generated/templates";

export function onDeployed(event: Deployed): void {
  if (event.params.poolName == BASIC_POOL_NAME) {
    let pool = getBasicTraderPool(
      event.params.at,
      event.params.basicToken,
      event.params.symbol,
      event.params.name,
      event.params.descriptionURL,
      event.block.timestamp
    );
    pool.save();

    let proposal = getProposalContract(event.params.proposalContract);
    proposal.save();

    BasicPool.create(event.params.at);
    RiskyProposal.create(event.params.proposalContract);
  }
}
