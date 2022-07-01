import { Address, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalClaimed,
  ProposalCreated,
  ProposalRestrictionsChanged,
  ProposalSupplied,
  ProposalWithdrawn,
} from "../../generated/templates/TraderPoolInvestProposal/TraderPoolInvestProposal";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getInvestProposalClaimOrSupply } from "../entities/trader-pool/invest-proposal/InvestProposalClaimSupply";
import { getInvestProposalCreate } from "../entities/trader-pool/invest-proposal/InvestProposalCreate";
import { getInvestProposalEdited } from "../entities/trader-pool/invest-proposal/InvestProposalEdited";
import { getInvestProposalWithdraw } from "../entities/trader-pool/invest-proposal/InvestProposalWithdraw";
import { getProposalContract } from "../entities/trader-pool/ProposalContract";
import { getRiskyProposalEdited } from "../entities/trader-pool/risky-proposal/RiskyProposalEdited";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTransaction } from "../entities/transaction/Transaction";
import { upcastCopy } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposalCreate = getInvestProposalCreate(event.transaction.hash, proposalContract.pool, event.params.proposalId);
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    getTraderPool(Address.fromString(proposalContract.pool.toHexString())).trader
  );

  proposalCreate.transaction = transaction.id;
  transaction.investProposalCreate = proposalCreate.id;
  transaction.type = getEnumBigInt(TransactionType.INVEST_PROPOSAL_CREATE);

  proposalCreate.save();
  transaction.save();
}

export function onProposalWithdrawn(event: ProposalWithdrawn): void {
  let pool = getProposalContract(event.address).pool;
  let withdraw = getInvestProposalWithdraw(event.transaction.hash, pool, event.params.proposalId, event.params.amount);
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  withdraw.transaction = transaction.id;
  transaction.investProposalWithdraw = withdraw.id;
  transaction.type = getEnumBigInt(TransactionType.INVEST_PROPOSAL_WITHDRAW);

  withdraw.save();
  transaction.save();
}

export function onProposalSupplied(event: ProposalSupplied): void {
  let pool = getProposalContract(event.address).pool;
  let supply = getInvestProposalClaimOrSupply(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    upcastCopy<Address, Bytes>(event.params.tokens),
    event.params.amounts
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  supply.transaction = transaction.id;
  transaction.investProposalClaimSupply = supply.id;
  transaction.type = getEnumBigInt(TransactionType.INVEST_PROPOSAL_SUPPLY);

  supply.save();
  transaction.save();
}

export function onProposalClaimed(event: ProposalClaimed): void {
  let pool = getProposalContract(event.address).pool;
  let supply = getInvestProposalClaimOrSupply(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    upcastCopy<Address, Bytes>(event.params.tokens),
    event.params.amounts
  );
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  supply.transaction = transaction.id;
  transaction.investProposalClaimSupply = supply.id;
  transaction.type = getEnumBigInt(TransactionType.INVEST_PROPOSAL_CLAIM);

  supply.save();
  transaction.save();
}

export function onProposalRestrictionsChanged(event: ProposalRestrictionsChanged): void {
  let pool = getProposalContract(event.address).pool;
  let edit = getInvestProposalEdited(event.transaction.hash, event.params.proposalId, pool);
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  edit.transaction = transaction.id;
  transaction.proposalEdit = edit.id;
  transaction.type = getEnumBigInt(TransactionType.INVEST_PROPOSAL_EDIT);

  edit.save();
  transaction.save();
}
