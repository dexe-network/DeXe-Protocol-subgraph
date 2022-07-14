import { Address } from "@graphprotocol/graph-ts";
import { ProposalDivested } from "../../generated/templates/TraderPool/TraderPool";
import { ProposalRestrictionsChanged } from "../../generated/templates/TraderPoolInvestProposal/TraderPoolInvestProposal";
import {
  ProposalCreated,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/TraderPoolRiskyProposal/TraderPoolRiskyProposal";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getExchange } from "../entities/trader-pool/Exchange";
import { getProposalContract } from "../entities/trader-pool/ProposalContract";
import { getRiskyProposalCreate } from "../entities/trader-pool/risky-proposal/RiskyProposalCreate";
import { getRiskyProposalEdited } from "../entities/trader-pool/risky-proposal/RiskyProposalEdited";
import { getRiskyProposalExchange } from "../entities/trader-pool/risky-proposal/RiskyProposalExchange";
import { getProposalVest } from "../entities/trader-pool/risky-proposal/ProposalVest";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTransaction } from "../entities/transaction/Transaction";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposalCreate = getRiskyProposalCreate(
    event.transaction.hash,
    proposalContract.pool,
    event.params.proposalId,
    event.params.token
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    getTraderPool(Address.fromString(proposalContract.pool.toHexString())).trader
  );

  proposalCreate.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_CREATE);

  proposalCreate.save();
  transaction.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let pool = getProposalContract(event.address).pool;
  let exchange = getRiskyProposalExchange(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  exchange.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_SWAP);

  exchange.save();
  transaction.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let pool = getProposalContract(event.address).pool;
  let vest = getProposalVest(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.investedBase,
    event.params.receivedLP2
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  vest.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_INVEST);

  vest.save();
  transaction.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let pool = getProposalContract(event.address).pool;
  let vest = getProposalVest(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.receivedBase,
    event.params.divestedLP2
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  vest.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_DIVEST);

  vest.save();
  transaction.save();
}

export function onProposalRestrictionsChanged(event: ProposalRestrictionsChanged): void {
  let pool = getProposalContract(event.address).pool;
  let edit = getRiskyProposalEdited(event.transaction.hash, event.params.proposalId, pool);
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  edit.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_EDIT);

  edit.save();
  transaction.save();
}
