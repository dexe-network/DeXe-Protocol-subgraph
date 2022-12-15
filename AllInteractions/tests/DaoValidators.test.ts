import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  createMockedFunction,
  describe,
  logStore,
  newMockEvent,
  test,
} from "matchstick-as/assembly/index";
import { onInternalProposalCreated, onInternalProposalExecuted, onVoted } from "../src/mappings/DaoValidators";
import {
  Voted,
  ChangedValidatorsBalances,
  ExternalProposalCreated,
  InternalProposalCreated,
  InternalProposalExecuted,
} from "../generated/templates/DaoValidators/DaoValidators";

import { assertTransaction, getBlock, getTransaction } from "./utils";
import { DaoPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { onDaoPoolDeployed } from "../src/mappings/PoolFactory";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createInternalProposalCreated(
  proposalId: BigInt,
  proposalDescription: string,
  quorum: BigInt,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InternalProposalCreated {
  let event = changetype<InternalProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("proposalDescription", ethereum.Value.fromString(proposalDescription)));
  event.parameters.push(new ethereum.EventParam("quorum", ethereum.Value.fromUnsignedBigInt(quorum)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createInternalProposalExecuted(
  proposalId: BigInt,
  executor: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InternalProposalExecuted {
  let event = changetype<InternalProposalExecuted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("executor", ethereum.Value.fromAddress(executor)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createVoted(
  proposalId: BigInt,
  sender: Address,
  vote: BigInt,
  isInternal: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Voted {
  let event = changetype<Voted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalIds", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("vote", ethereum.Value.fromUnsignedBigInt(vote)));
  event.parameters.push(new ethereum.EventParam("isInternal", ethereum.Value.fromBoolean(isInternal)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");

describe("DaoValidators", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle InternalProposalCreated", () => {
    let proposalId = BigInt.fromI32(2);
    let quorum = BigInt.fromI32(100);
    let description = "d";
    let sender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let event = createInternalProposalCreated(proposalId, description, quorum, sender, contractSender, block, tx);

    onInternalProposalCreated(event);

    assert.fieldEquals(
      "DaoValidatorProposalCreate",
      tx.hash.concatI32(0).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "DaoValidatorProposalCreate",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_VALIDATORS_PROPOSAL_CREATED}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle InternalProposalExecuted", () => {
    let proposalId = BigInt.fromI32(2);
    let quorum = BigInt.fromI32(100);
    let description = "d";
    let sender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let createEvent = createInternalProposalCreated(proposalId, description, quorum, sender, contractSender, block, tx);

    onInternalProposalCreated(createEvent);

    let executor = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let event = createInternalProposalExecuted(proposalId, executor, contractSender, block, tx);

    onInternalProposalExecuted(event);

    assert.fieldEquals(
      "DaoValidatorProposalExecute",
      tx.hash.concatI32(1).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "DaoValidatorProposalExecute",
      tx.hash.concatI32(1).toHexString(),
      "proposalId",
      proposalId.toString()
    );

    assertTransaction(
      tx.hash,
      event.params.executor,
      block,
      `[${TransactionType.DAO_VALIDATORS_PROPOSAL_CREATED}, ${TransactionType.DAO_VALIDATORS_PROPOSAL_EXECUTED}]`,
      BigInt.fromI32(2)
    );
  });

  test("should handle Voted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let vote = BigInt.fromI32(100);
    let isInternal = true;

    let event = createVoted(proposalId, sender, vote, isInternal, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals(
      "DaoValidatorProposalVote",
      tx.hash.concatI32(0).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "DaoValidatorProposalVote",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("DaoValidatorProposalVote", tx.hash.concatI32(0).toHexString(), "amount", vote.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_VALIDATORS_VOTED}]`,
      BigInt.fromI32(1)
    );
  });
});
