import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import {
  onChangedValidatorsBalances,
  onExternalProposalCreated,
  onInternalProposalCreated,
  onInternalProposalExecuted,
  onVoteCanceled,
  onVoted,
} from "../src/mappings/DaoValidators";
import {
  Voted,
  ChangedValidatorsBalances,
  ExternalProposalCreated,
  InternalProposalCreated,
  InternalProposalExecuted,
  VoteCanceled,
} from "../generated/templates/DaoValidators/DaoValidators";

import { getBlock, getNextTx, getTransaction } from "./utils";
import { DaoPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { onDeployed } from "../src/mappings/PoolFactory";
import { ProposalInteractionType } from "../src/entities/global/ProposalInteractionTypeEnum";

function createExternalProposalCreated(
  proposalId: BigInt,
  quorum: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ExternalProposalCreated {
  let event = changetype<ExternalProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("quorum", ethereum.Value.fromUnsignedBigInt(quorum)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

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
  isVoteFor: boolean,
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
  event.parameters.push(new ethereum.EventParam("isVoteFor", ethereum.Value.fromBoolean(isVoteFor)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createVoteCanceled(
  proposalId: BigInt,
  sender: Address,
  isInternal: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): VoteCanceled {
  let event = changetype<VoteCanceled>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("isInternal", ethereum.Value.fromBoolean(isInternal)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createChangedValidatorsBalances(
  validators: Array<Address>,
  newBalance: Array<BigInt>,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ChangedValidatorsBalances {
  let event = changetype<ChangedValidatorsBalances>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddressArray(validators)));
  event.parameters.push(new ethereum.EventParam("newBalance", ethereum.Value.fromUnsignedBigIntArray(newBalance)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createDaoPoolDeployed(
  name: string,
  govPool: Address,
  dp: Address,
  validators: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DaoPoolDeployed {
  let event = changetype<DaoPoolDeployed>(newMockEvent());
  event.parameters = new Array();

  let govPoolDeps = new ethereum.Tuple(5);
  govPoolDeps[2] = ethereum.Value.fromAddress(validators);

  event.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString(name)));
  event.parameters.push(new ethereum.EventParam("govPool", ethereum.Value.fromAddress(govPool)));
  event.parameters.push(new ethereum.EventParam("govPoolDeps", ethereum.Value.fromTuple(govPoolDeps)));
  event.parameters.push(new ethereum.EventParam("distributionProposal", ethereum.Value.fromAddress(dp)));
  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddress(validators)));

  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181680");
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const name = "name";

describe("DaoValidators", () => {
  beforeEach(() => {
    let poolCreate = createDaoPoolDeployed(
      name,
      poolAddress,
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670"),
      contractSender,
      block,
      tx
    );

    onDeployed(poolCreate);
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle ExternalProposalCreated", () => {
    let proposalId = BigInt.fromI32(1);
    let quorum = BigInt.fromI32(100);
    let event = createExternalProposalCreated(proposalId, quorum, contractSender, block, tx);

    onExternalProposalCreated(event);

    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "isInternal",
      "false"
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "0", "description", "");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "quorum",
      quorum.toString()
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "0", "totalVoteFor", "0");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "executor",
      Bytes.empty().toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "creator",
      Bytes.empty().toHexString()
    );

    proposalId = BigInt.fromI32(2);
    event = createExternalProposalCreated(proposalId, quorum, contractSender, block, tx);

    onExternalProposalCreated(event);

    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "isInternal",
      "false"
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "0", "description", "");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "quorum",
      quorum.toString()
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "0", "totalVoteFor", "0");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "executor",
      Bytes.empty().toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "0",
      "creator",
      Bytes.empty().toHexString()
    );
  });

  test("should handle InternalProposalCreated", () => {
    let proposalId = BigInt.fromI32(2);
    let quorum = BigInt.fromI32(100);
    let description = "d";
    let sender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let event = createInternalProposalCreated(proposalId, description, quorum, sender, contractSender, block, tx);

    onInternalProposalCreated(event);

    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "1", "isInternal", "true");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "description",
      description
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "quorum",
      quorum.toString()
    );
    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "1", "totalVoteFor", "0");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "executor",
      Bytes.empty().toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "creator",
      sender.toHexString()
    );
  });

  test("should handle InternalProposalExecuted", () => {
    let proposalId = BigInt.fromI32(1);
    let quorum = BigInt.fromI32(100);
    let description = "d";
    let sender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let createEvent = createInternalProposalCreated(proposalId, description, quorum, sender, contractSender, block, tx);

    onInternalProposalCreated(createEvent);

    let executor = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");

    let event = createInternalProposalExecuted(proposalId, executor, contractSender, block, tx);

    onInternalProposalExecuted(event);

    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "1", "isInternal", "true");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "executor",
      executor.toHexString()
    );

    proposalId = BigInt.fromI32(2);
    createEvent = createInternalProposalCreated(proposalId, description, quorum, sender, contractSender, block, tx);

    onInternalProposalCreated(createEvent);

    event = createInternalProposalExecuted(proposalId, executor, contractSender, block, tx);

    onInternalProposalExecuted(event);

    assert.fieldEquals("Proposal", poolAddress.toHexString() + proposalId.toString() + "_" + "1", "isInternal", "true");
    assert.fieldEquals(
      "Proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1",
      "executor",
      executor.toHexString()
    );
  });

  test("should handle Vote", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let vote = BigInt.fromI32(100);
    let isInternal = true;
    let isVoteFor = true;

    let event = createVoted(proposalId, sender, vote, isInternal, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteFor",
      vote.toString()
    );
    assert.fieldEquals("ProposalInteraction", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "timestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1"
    );
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "interactionType",
      ProposalInteractionType.VOTE_FOR.toString()
    );
    assert.fieldEquals("ProposalInteraction", tx.hash.concatI32(0).toHexString(), "amount", vote.toString());
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "voter",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString()
    );

    isVoteFor = false;

    const nextTx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(2))));
    event = createVoted(proposalId, sender, vote, isInternal, isVoteFor, contractSender, block, nextTx);

    onVoted(event);

    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainst",
      vote.toString()
    );
    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteFor",
      vote.toString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "hash",
      nextTx.hash.toHexString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "timestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1"
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "interactionType",
      ProposalInteractionType.VOTE_AGAINST.toString()
    );
    assert.fieldEquals("ProposalInteraction", nextTx.hash.concatI32(0).toHexString(), "amount", vote.toString());
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "voter",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString()
    );
  });

  test("should handle VoteCanceled", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let vote = BigInt.fromI32(100);
    let isInternal = true;
    let isVoteFor = true;

    let votedEvent = createVoted(proposalId, sender, vote, isInternal, isVoteFor, contractSender, block, tx);

    onVoted(votedEvent);

    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteFor",
      vote.toString()
    );
    assert.fieldEquals("ProposalInteraction", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "timestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1"
    );
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "interactionType",
      ProposalInteractionType.VOTE_FOR.toString()
    );
    assert.fieldEquals("ProposalInteraction", tx.hash.concatI32(0).toHexString(), "amount", vote.toString());
    assert.fieldEquals(
      "ProposalInteraction",
      tx.hash.concatI32(0).toHexString(),
      "voter",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString()
    );

    const nextTx = getNextTx(tx);
    let event = createVoteCanceled(proposalId, sender, isInternal, contractSender, block, nextTx);

    onVoteCanceled(event);

    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainst",
      "0"
    );
    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteFor",
      "0"
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "hash",
      nextTx.hash.toHexString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "timestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "proposal",
      poolAddress.toHexString() + proposalId.toString() + "_" + "1"
    );
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "interactionType",
      ProposalInteractionType.VOTE_CANCEL.toString()
    );
    assert.fieldEquals("ProposalInteraction", nextTx.hash.concatI32(0).toHexString(), "amount", "0");
    assert.fieldEquals(
      "ProposalInteraction",
      nextTx.hash.concatI32(0).toHexString(),
      "voter",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString()
    );
  });

  test("should handle ChangedValidatorsBalances", () => {
    let validators = [
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675"),
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181676"),
    ];
    let newBalance = [BigInt.fromI32(10).pow(18), BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2))];

    let event = createChangedValidatorsBalances(validators, newBalance, contractSender, block, tx);

    onChangedValidatorsBalances(event);

    for (let i = 0; i < validators.length; i++) {
      assert.fieldEquals(
        "ValidatorInPool",
        validators[i].concat(poolAddress).toHexString(),
        "balance",
        newBalance[i].toString()
      );
      assert.fieldEquals(
        "ValidatorInPool",
        validators[i].concat(poolAddress).toHexString(),
        "pool",
        poolAddress.toHexString()
      );

      assert.fieldEquals(
        "ValidatorInPool",
        validators[i].concat(poolAddress).toHexString(),
        "validatorAddress",
        validators[i].toHexString()
      );
    }

    validators = [validators[0]];

    event = createChangedValidatorsBalances(validators, [BigInt.zero()], contractSender, block, tx);

    onChangedValidatorsBalances(event);

    assert.fieldEquals(
      "ValidatorInPool",
      validators[0].concat(poolAddress).toHexString(),
      "balance",
      BigInt.zero().toString()
    );
    assert.fieldEquals(
      "ValidatorInPool",
      validators[0].concat(poolAddress).toHexString(),
      "validatorAddress",
      validators[0].toHexString()
    );
    assert.fieldEquals(
      "ValidatorInPool",
      validators[0].concat(poolAddress).toHexString(),
      "pool",
      Bytes.empty().toHexString()
    );
  });
});
