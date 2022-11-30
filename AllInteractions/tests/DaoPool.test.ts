import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  describe,
  logStore,
  newMockEvent,
  test,
} from "matchstick-as/assembly/index";
import { assertTransaction, getBlock, getTransaction } from "./utils";
import {
  Delegated,
  Deposited,
  DPCreated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Voted,
  Withdrawn,
} from "../generated/templates/DaoPool/DaoPool";
import { onDelegated, onProposalCreated, onProposalExecuted, onVoted, onRewardClaimed } from "../src/mappings/DaoPool";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createProposalCreated(
  proposalId: BigInt,
  sender: Address,
  quorum: BigInt,
  settingsId: BigInt,
  description: string,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("proposalDescription", ethereum.Value.fromString(description)));
  event.parameters.push(new ethereum.EventParam("quorum", ethereum.Value.fromUnsignedBigInt(quorum)));
  event.parameters.push(new ethereum.EventParam("proposalSettings", ethereum.Value.fromUnsignedBigInt(settingsId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createDelegated(
  from: Address,
  to: Address,
  amount: BigInt,
  nfts: Array<BigInt>,
  flag: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Delegated {
  let event = changetype<Delegated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("nfts", ethereum.Value.fromUnsignedBigIntArray(nfts)));
  event.parameters.push(new ethereum.EventParam("isDelegate", ethereum.Value.fromBoolean(flag)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createVoted(
  proposalId: BigInt,
  sender: Address,
  personalVote: BigInt,
  delegatedVote: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Voted {
  let event = changetype<Voted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("personalVote", ethereum.Value.fromUnsignedBigInt(personalVote)));
  event.parameters.push(new ethereum.EventParam("delegatedVote", ethereum.Value.fromUnsignedBigInt(delegatedVote)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createProposalExecuted(
  proposalId: BigInt,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalExecuted {
  let event = changetype<ProposalExecuted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createRewardClaimed(
  proposalId: BigInt,
  sender: Address,
  token: Address,
  amount: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): RewardClaimed {
  let event = changetype<RewardClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createDeposited(
  amount: BigInt,
  nfts: Array<BigInt>,
  to: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Delegated {
  let event = changetype<Delegated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("nfts", ethereum.Value.fromUnsignedBigIntArray(nfts)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createWithdrawn(
  amount: BigInt,
  nfts: Array<BigInt>,
  to: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Withdrawn {
  let event = changetype<Withdrawn>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("nfts", ethereum.Value.fromUnsignedBigIntArray(nfts)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const settingsId = BigInt.fromI32(2);

describe("DaoPool", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle ProposalCreated", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let quorum = BigInt.fromI32(100);

    let event = createProposalCreated(proposalId, sender, quorum, settingsId, "description", contractSender, block, tx);

    onProposalCreated(event);

    assert.fieldEquals("DaoProposalCreate", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoProposalCreate", tx.hash.concatI32(0).toHexString(), "name", contractSender.toHexString());
    assert.fieldEquals("DaoProposalCreate", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      "[" + TransactionType.DAO_POOL_PROPOSAL_CREATED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle Delegated", () => {
    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];

    let event0 = createDelegated(from, to, amount, nfts, true, contractSender, block, tx);

    onDelegated(event0);

    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());

    assertTransaction(
      tx.hash,
      event0.params.from,
      block,
      "[" + TransactionType.DAO_POOL_DELEGATED.toString() + "]",
      BigInt.fromI32(1)
    );

    let event1 = createDelegated(from, to, amount, nfts, false, contractSender, block, tx);

    onDelegated(event1);

    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());

    assertTransaction(
      tx.hash,
      event1.params.from,
      block,
      "[" + TransactionType.DAO_POOL_UNDELEGATED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle Voted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let personalVote = BigInt.fromI32(1000);
    let delegatedVote = BigInt.fromI32(100);

    let event = createVoted(proposalId, sender, personalVote, delegatedVote, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("DaoPoolVote", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DaoPoolVote",
      tx.hash.concatI32(0).toHexString(),
      "amount",
      personalVote.plus(delegatedVote).toString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      "[" + TransactionType.DAO_POOL_PROPOSAL_VOTED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle ProposalExecuted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createProposalExecuted(proposalId, sender, contractSender, block, tx);

    onProposalExecuted(event);

    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "name", contractSender.toHexString());
    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      "[" + TransactionType.DAO_POOL_PROPOSAL_EXECUTED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle RewardClaimed", () => {
    let proposalIds = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let tokens = [
      Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672"),
      Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181673"),
    ];
    let amounts = [BigInt.fromI32(10).pow(18), BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2))];

    let event = createRewardClaimed(proposalIds[0], sender, tokens[0], amounts[0], contractSender, block, tx);

    onRewardClaimed(event);

    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "name", contractSender.toHexString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      "[" + TransactionType.DAO_POOL_REWARD_CLAIMED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle Deposited", () => {
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let to = Address.fromHexString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createDeposited(amount, nfts, to, contractSender, block, tx);

    onDelegated(event);

    assert.fieldEquals("DaoPoolDeposited", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDeposited", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals(
      "DaoPoolDeposited",
      tx.hash.concatI32(0).toHexString(),
      "nfts",
      "[" + nfts[0].toString() + "," + nfts[1].toString() + "]"
    );

    assertTransaction(
      tx.hash,
      event.params.to,
      block,
      "[" + TransactionType.DAO_POOL_DEPOSITED.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle Withdrawn", () => {
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let to = Address.fromHexString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createDeposited(amount, nfts, to, contractSender, block, tx);

    onDelegated(event);

    assert.fieldEquals("DaoPoolDeposited", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDeposited", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals(
      "DaoPoolDeposited",
      tx.hash.concatI32(0).toHexString(),
      "nfts",
      "[" + nfts[0].toString() + "," + nfts[1].toString() + "]"
    );

    assertTransaction(
      tx.hash,
      event.params.to,
      block,
      "[" + TransactionType.DAO_POOL_WITHDRAWN.toString() + "]",
      BigInt.fromI32(1)
    );
  });
});
