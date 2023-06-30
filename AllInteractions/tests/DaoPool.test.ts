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
  MovedToValidators,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Voted,
  Withdrawn,
} from "../generated/templates/DaoPool/DaoPool";
import {
  onDelegated,
  onProposalCreated,
  onProposalExecuted,
  onVoted,
  onRewardClaimed,
  onDeposited,
  onWithdrawn,
  onMovedToValidators,
} from "../src/mappings/DaoPool";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createProposalCreated(
  proposalId: BigInt,
  sender: Address,
  quorum: BigInt,
  settingsId: BigInt,
  rewardToken: Address,
  description: string,
  misc: string,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("proposalDescription", ethereum.Value.fromString(description)));
  event.parameters.push(new ethereum.EventParam("misc", ethereum.Value.fromString(misc)));
  event.parameters.push(new ethereum.EventParam("quorum", ethereum.Value.fromUnsignedBigInt(quorum)));
  event.parameters.push(new ethereum.EventParam("proposalSettings", ethereum.Value.fromUnsignedBigInt(settingsId)));
  event.parameters.push(new ethereum.EventParam("rewardToken", ethereum.Value.fromAddress(rewardToken)));
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
  isVoteFor: boolean,
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
  event.parameters.push(new ethereum.EventParam("isVoteFor", ethereum.Value.fromBoolean(isVoteFor)));

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
): Deposited {
  let event = changetype<Deposited>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("nfts", ethereum.Value.fromUnsignedBigIntArray(nfts)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(to)));

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

function createMovedToValidators(
  proposalId: BigInt,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): MovedToValidators {
  let event = changetype<MovedToValidators>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

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

    let event = createProposalCreated(
      proposalId,
      sender,
      quorum,
      settingsId,
      Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181678"),
      "description",
      "misc",
      contractSender,
      block,
      tx
    );

    onProposalCreated(event);

    assert.fieldEquals("DaoProposalCreate", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoProposalCreate", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_PROPOSAL_CREATED}]`,
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

    assertTransaction(tx.hash, event0.params.from, block, `[${TransactionType.DAO_POOL_DELEGATED}]`, BigInt.fromI32(1));

    let event1 = createDelegated(from, to, amount, nfts, false, contractSender, block, tx);

    onDelegated(event1);

    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDelegate", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());

    assertTransaction(
      tx.hash,
      event1.params.from,
      block,
      `[${TransactionType.DAO_POOL_DELEGATED}, ${TransactionType.DAO_POOL_UNDELEGATED}]`,
      BigInt.fromI32(2)
    );
  });

  test("should handle Voted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let personalVote = BigInt.fromI32(1000);
    let delegatedVote = BigInt.fromI32(100);
    let isVoteFor = true;

    let event = createVoted(proposalId, sender, personalVote, delegatedVote, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("DaoPoolVote", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DaoPoolVote",
      tx.hash.concatI32(0).toHexString(),
      "amount",
      personalVote.plus(delegatedVote).toString()
    );
    assert.fieldEquals("DaoPoolVote", tx.hash.concatI32(0).toHexString(), "isVoteFor", isVoteFor.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_PROPOSAL_VOTED}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle ProposalExecuted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createProposalExecuted(proposalId, sender, contractSender, block, tx);

    onProposalExecuted(event);

    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolExecute", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_PROPOSAL_EXECUTED}]`,
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

    assert.fieldEquals("DaoPoolRewardClaim", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DaoPoolRewardClaim",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalIds[0].toString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_REWARD_CLAIMED}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle Deposited", () => {
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createDeposited(amount, nfts, to, contractSender, block, tx);

    onDeposited(event);

    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "nfts", `[${nfts[0]}, ${nfts[1]}]`);

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_DEPOSITED}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle Withdrawn", () => {
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createWithdrawn(amount, nfts, to, contractSender, block, tx);

    onWithdrawn(event);

    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DaoPoolDeposit", tx.hash.concatI32(0).toHexString(), "nfts", `[${nfts[0]}, ${nfts[1]}]`);

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_WITHDRAWN}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle MovedToValidator", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createMovedToValidators(proposalId, sender, contractSender, block, tx);

    onMovedToValidators(event);

    assert.fieldEquals(
      "DaoPoolMovedToValidators",
      tx.hash.concatI32(0).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "DaoPoolMovedToValidators",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_MOVED_TO_VALIDATORS}]`,
      BigInt.fromI32(1)
    );
  });
});
