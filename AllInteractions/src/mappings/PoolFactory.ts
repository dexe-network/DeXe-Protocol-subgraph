import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { TraderPool, TraderPoolInvestProposal } from "../../generated/templates";
import { TraderPoolRiskyProposal } from "../../generated/templates";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getPoolCreate } from "../entities/trader-pool/PoolCreate";
import { getProposalContract } from "../entities/trader-pool/ProposalContract";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTransaction } from "../entities/transaction/Transaction";

export function onDeployed(event: TraderPoolDeployed): void {
  getTraderPool(event.params.at, event.params.proposalContract, event.params.trader).save();
  TraderPool.create(event.params.at);

  getProposalContract(event.params.proposalContract, event.params.at).save();

  if (event.params.poolType == BASIC_POOL_NAME) {
    TraderPoolRiskyProposal.create(event.params.proposalContract);
  } else {
    TraderPoolInvestProposal.create(event.params.proposalContract);
  }

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.trader
  );
  let create = getPoolCreate(event.transaction.hash, event.address, event.params.symbol);

  transaction.type = getEnumBigInt(TransactionType.POOL_CREATE);
  create.transaction = transaction.id;

  transaction.save();
  create.save();
}
