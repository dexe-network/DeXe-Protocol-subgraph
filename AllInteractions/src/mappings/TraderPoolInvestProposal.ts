import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalClaimed,
  ProposalConverted,
  ProposalCreated,
  ProposalInvested,
  ProposalRestrictionsChanged,
  ProposalSupplied,
  ProposalWithdrawn,
} from "../../generated/templates/TraderPoolInvestProposal/TraderPoolInvestProposal";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getInvestProposalClaimOrSupply } from "../entities/trader-pool/invest-proposal/InvestProposalClaimSupply";
import { getInvestProposalConvertToDividends } from "../entities/trader-pool/invest-proposal/InvestProposalConvertToDividends";
import { getInvestProposalCreate } from "../entities/trader-pool/invest-proposal/InvestProposalCreate";
import { getInvestProposalEdited } from "../entities/trader-pool/invest-proposal/InvestProposalEdited";
import { getInvestProposalWithdraw } from "../entities/trader-pool/invest-proposal/InvestProposalWithdraw";
import { getProposalContract } from "../entities/trader-pool/ProposalContract";
import { getProposalVest } from "../entities/trader-pool/risky-proposal/ProposalVest";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTransaction } from "../entities/transaction/Transaction";
import { extendArray, upcastCopy } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    getTraderPool(Address.fromBytes(proposalContract.pool)).trader
  );
  let proposalCreate = getInvestProposalCreate(
    event.transaction.hash,
    proposalContract.pool,
    event.params.proposalId,
    transaction.interactionsCount
  );

  proposalCreate.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_CREATE)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  proposalCreate.save();
  transaction.save();
}

export function onProposalWithdrawn(event: ProposalWithdrawn): void {
  let pool = getProposalContract(event.address).pool;
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let withdraw = getInvestProposalWithdraw(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.amount,
    transaction.interactionsCount
  );

  withdraw.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_WITHDRAW)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  withdraw.save();
  transaction.save();
}

export function onProposalSupplied(event: ProposalSupplied): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let supply = getInvestProposalClaimOrSupply(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    upcastCopy<Address, Bytes>(event.params.tokens),
    event.params.amounts,
    transaction.interactionsCount
  );

  supply.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_SUPPLY)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  supply.save();
  transaction.save();
}

export function onProposalClaimed(event: ProposalClaimed): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );
  let supply = getInvestProposalClaimOrSupply(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    upcastCopy<Address, Bytes>(event.params.tokens),
    event.params.amounts,
    transaction.interactionsCount
  );

  supply.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_CLAIM)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  supply.save();
  transaction.save();
}

export function onProposalRestrictionsChanged(event: ProposalRestrictionsChanged): void {
  let pool = getProposalContract(event.address).pool;
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let edit = getInvestProposalEdited(
    event.transaction.hash,
    event.params.proposalId,
    pool,
    transaction.interactionsCount
  );
  edit.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_EDIT)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  edit.save();
  transaction.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  let vest = getProposalVest(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.investedBase,
    event.params.receivedLP2,
    transaction.interactionsCount
  );
  vest.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INVEST_PROPOSAL_INVEST)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  vest.save();
  transaction.save();
}

export function onProposalConverted(event: ProposalConverted): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  let convertToDividends = getInvestProposalConvertToDividends(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.amount,
    event.params.baseToken,
    transaction.interactionsCount
  );

  convertToDividends.transaction = transaction.id;
  transaction.type = extendArray<BigInt>(transaction.type, [
    getEnumBigInt(TransactionType.INVEST_PROPOSAL_CONVERT_TO_DIVIDENDS),
  ]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  convertToDividends.save();
  transaction.save();
}
