import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  logStore,
  newMockEvent,
  test,
} from "matchstick-as/assembly/index";
import { getBlock, getTransaction } from "./utils";
import {
  Delegated,
  Deposited,
  Withdrawn,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  RewardCredited,
  Voted,
  StakingRewardClaimed,
  OffchainResultsSaved,
  Requested,
  DelegatedTreasury,
} from "../generated/templates/DaoPool/DaoPool";
import {
  onDelegated,
  onProposalCreated,
  onProposalExecuted,
  onVoted,
  onRewardClaimed,
  onRewardCredited,
  onDeposited,
  onWithdrawn,
  onStakingRewardClaimed,
  onOffchainResultsSaved,
  onRequested,
  onDelegatedTreasury,
} from "../src/mappings/DaoPool";
import {
  PRICE_FEED_ADDRESS,
  REWARD_TYPE_CREATE,
  REWARD_TYPE_VOTE_AGAINST,
  REWARD_TYPE_VOTE_AGAINST_DELEGATED,
  REWARD_TYPE_VOTE_FOR,
  REWARD_TYPE_VOTE_FOR_DELEGATED,
} from "../src/entities/global/globals";
import { ProposalSettings } from "../generated/schema";
import { createSetERC20 } from "./UserKeeper.test";
import { getUserKeeperContract } from "../src/entities/UserKeeperContract";
import { onSetERC20 } from "../src/mappings/UserKeeper";
import { DelegationType } from "../src/entities/global/DelegationTypeEnum";
import { getDaoPool } from "../src/entities/DaoPool";
import { VoteType, getEnumBigInt } from "../src/entities/global/VoteTypeEnum";
import { TreasuryDelegationType } from "../src/entities/global/TreasuryDelegationTypeEnum";

function createProposalCreated(
  proposalId: BigInt,
  sender: Address,
  quorum: BigInt,
  settingsId: BigInt,
  rewardToken: Address,
  description: string,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("proposalDescription", ethereum.Value.fromString(description)));
  event.parameters.push(new ethereum.EventParam("actionsOnFor", ethereum.Value.fromTupleArray([])));
  event.parameters.push(new ethereum.EventParam("actionsOnAgainst", ethereum.Value.fromTupleArray([])));
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

function createDelegatedTreasury(
  to: Address,
  amount: BigInt,
  nfts: Array<BigInt>,
  flag: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DelegatedTreasury {
  let event = changetype<DelegatedTreasury>(newMockEvent());
  event.parameters = new Array();

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
  voteType: BigInt,
  amount: BigInt,
  isVoteFor: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Voted {
  let event = changetype<Voted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("voteType", ethereum.Value.fromUnsignedBigInt(voteType)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("isVoteFor", ethereum.Value.fromBoolean(isVoteFor)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createDPCreated(
  proposalId: BigInt,
  sender: Address,
  token: Address,
  amount: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DPCreated {
  let event = changetype<DPCreated>(newMockEvent());
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

function createProposalExecuted(
  proposalId: BigInt,
  isFor: boolean,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalExecuted {
  let event = changetype<ProposalExecuted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("isFor", ethereum.Value.fromBoolean(isFor)));
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

function createRewardCredited(
  proposalId: BigInt,
  rewardType: BigInt,
  rewardToken: Address,
  amount: BigInt,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): RewardCredited {
  rewardType;
  let event = changetype<RewardCredited>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("rewardType", ethereum.Value.fromUnsignedBigInt(rewardType)));
  event.parameters.push(new ethereum.EventParam("rewardToken", ethereum.Value.fromAddress(rewardToken)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

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

function createStakingRewardClaimed(
  user: Address,
  token: Address,
  amount: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): StakingRewardClaimed {
  let event = changetype<StakingRewardClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createOffchainResultsSaved(
  sender: Address,
  resultsHash: string,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): OffchainResultsSaved {
  let event = changetype<OffchainResultsSaved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("resultsHash", ethereum.Value.fromString(resultsHash)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createRequested(
  from: Address,
  to: Address,
  amount: BigInt,
  nfts: BigInt[],
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Requested {
  let event = changetype<Requested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("nfts", ethereum.Value.fromUnsignedBigIntArray(nfts)));

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
  beforeAll(() => {
    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181672")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1000000000000000000)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1000000000000000000)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181673")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(2000000000000000000)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(2000000000000000000)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1000)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(200)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(500)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(100)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(3000)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1500)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    let settings = new ProposalSettings(contractSender.concatI32(settingsId.toI32()));
    settings.settingsId = settingsId;
    settings.pool = contractSender;
    settings.executorDescription = "";
    settings.save();
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle ProposalCreated", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let quorum = BigInt.fromI32(100);

    let event = createProposalCreated(
      proposalId,
      sender,
      quorum,
      settingsId,
      rewardToken,
      "description",
      contractSender,
      block,
      tx
    );

    onProposalCreated(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "votersCount", "0");

    assert.fieldEquals("Voter", sender.toHexString(), "totalProposalsCreated", "1");

    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "creator",
      sender.toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executor",
      Bytes.empty().toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executionTimestamp",
      "0"
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "currentVotesFor", "0");
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesAgainst",
      "0"
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "quorum", "100");
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "0");
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "settings",
      contractSender.concatI32(settingsId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "rewardToken",
      rewardToken.toHexString()
    );
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "proposalCount", "1");
  });

  test("should handle Delegated", () => {
    let pool = getDaoPool(contractSender);
    pool.erc20Token = Bytes.fromHexString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    pool.save();

    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount = BigInt.fromI32(1000);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];

    let event = createDelegated(from, to, amount, nfts, true, contractSender, block, tx);

    onDelegated(event);

    assert.fieldEquals("Voter", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Voter", from.toHexString(), "totalDelegatedUSD", "200");
    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("Voter", to.toHexString(), "delegatorsCount", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "votersCount", "2");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegated", amount.toString());
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegated", `[${nfts[0]}, ${nfts[1]}]`);
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedDelegation", amount.toString());
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedNFTDelegation",
      `[${nfts[0]}, ${nfts[1]}]`
    );
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "2");
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "joinedTimestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      from.concat(contractSender).toHexString(),
      "joinedTimestamp",
      block.timestamp.toString()
    );

    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "timestamp",
      event.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "from", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "to", to.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "nfts", `[${nfts[0]}, ${nfts[1]}]`);
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "type",
      DelegationType.DELEGATE.toString()
    );

    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "from",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateAmount",
      amount.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateNfts",
      `[${nfts[0]}, ${nfts[1]}]`
    );
  });

  test("should handle Undelegated", () => {
    let pool = getDaoPool(contractSender);
    pool.erc20Token = Bytes.fromHexString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    pool.save();

    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount1 = BigInt.fromI32(1000);
    let amount2 = BigInt.fromI32(500);
    let nfts1 = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let nfts2 = [BigInt.fromI32(1)];

    let event1 = createDelegated(from, to, amount1, nfts1, true, contractSender, block, tx);
    let event2 = createDelegated(from, to, amount2, nfts2, false, contractSender, block, tx);

    onDelegated(event1);
    onDelegated(event2);

    assert.fieldEquals("Voter", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Voter", from.toHexString(), "totalDelegatedUSD", "100");
    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("Voter", to.toHexString(), "delegatorsCount", "1");
    assert.fieldEquals(
      "DaoPool",
      contractSender.toHexString(),
      "totalCurrentTokenDelegated",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegated", `[${nfts1[1]}]`);
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "1");
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedDelegation",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedNFTDelegation",
      `[${nfts1[1]}]`
    );
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "1");
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "timestamp",
      event2.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "from", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "to", to.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "amount", amount2.toString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "nfts", `[${nfts2[0]}]`);
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "type",
      DelegationType.UNDELEGATE.toString()
    );

    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "from",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateAmount",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateNfts",
      `[${nfts1[1]}]`
    );
  });

  test("should handle DelegatedTreasury", () => {
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];

    let event = createDelegatedTreasury(to, amount, nfts, true, contractSender, block, tx);

    onDelegatedTreasury(event);

    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "votersCount", "1");
    assert.fieldEquals(
      "DaoPool",
      contractSender.toHexString(),
      "totalCurrentTokenDelegatedTreasury",
      amount.toString()
    );
    assert.fieldEquals(
      "DaoPool",
      contractSender.toHexString(),
      "totalCurrentNFTDelegatedTreasury",
      `[${nfts[0]}, ${nfts[1]}]`
    );
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "1");
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryDelegation",
      amount.toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryNFTDelegation",
      `[${nfts[0]}, ${nfts[1]}]`
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryNFTDelegationCount",
      "2"
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "joinedTimestamp",
      block.timestamp.toString()
    );

    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "timestamp",
      event.block.timestamp.toString()
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals("TreasuryDelegationHistory", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "nfts",
      `[${nfts[0]}, ${nfts[1]}]`
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "type",
      TreasuryDelegationType.DELEGATE.toString()
    );
  });

  test("should handle UndelegatedTreasury", () => {
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount1 = BigInt.fromI32(100).pow(18);
    let amount2 = BigInt.fromI32(50).pow(18);
    let nfts1 = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let nfts2 = [BigInt.fromI32(1)];

    let event1 = createDelegatedTreasury(to, amount1, nfts1, true, contractSender, block, tx);
    let event2 = createDelegatedTreasury(to, amount2, nfts2, false, contractSender, block, tx);

    onDelegatedTreasury(event1);
    onDelegatedTreasury(event2);

    assert.fieldEquals(
      "DaoPool",
      contractSender.toHexString(),
      "totalCurrentTokenDelegatedTreasury",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatedTreasury", `[${nfts1[1]}]`);
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "1");
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryDelegation",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryNFTDelegation",
      `[${nfts1[1]}]`
    );
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedTreasuryNFTDelegationCount",
      "1"
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "timestamp",
      event2.block.timestamp.toString()
    );
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals("TreasuryDelegationHistory", tx.hash.concatI32(1).toHexString(), "amount", amount2.toString());
    assert.fieldEquals("TreasuryDelegationHistory", tx.hash.concatI32(1).toHexString(), "nfts", `[${nfts2[0]}]`);
    assert.fieldEquals(
      "TreasuryDelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "type",
      TreasuryDelegationType.UNDELEGATE.toString()
    );
  });

  test("should handle voted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let voteType = getEnumBigInt(VoteType.PERSONAL);
    let amountFor = BigInt.fromI32(1000);
    let isVoteFor = true;

    let event = createVoted(proposalId, sender, voteType, amountFor, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals("Voter", sender.toHexString(), "totalVotes", amountFor.toString());
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesFor",
      amountFor.toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "voter",
      sender.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainstAmount",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      BigInt.zero().toString()
    );

    let amountAgainst = BigInt.fromI32(200);
    isVoteFor = false;

    const nextTx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

    event = createVoted(proposalId, sender, voteType, amountAgainst, isVoteFor, contractSender, block, nextTx);

    onVoted(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals("Voter", sender.toHexString(), "totalVotes", amountFor.plus(amountAgainst).toString());
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesAgainst",
      amountAgainst.toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "voter",
      sender.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainstAmount",
      amountAgainst.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      BigInt.zero().toString()
    );

    voteType = getEnumBigInt(VoteType.DELEGATED);
    isVoteFor = true;

    event = createVoted(proposalId, sender, voteType, amountFor, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals(
      "Voter",
      sender.toHexString(),
      "totalVotes",
      amountFor.times(BigInt.fromI32(2)).plus(amountAgainst).toString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesFor",
      amountFor.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "voter",
      sender.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainstAmount",
      amountAgainst.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteAgainstAmount",
      "0"
    );

    voteType = getEnumBigInt(VoteType.MICROPOOL);

    event = createVoted(proposalId, sender, voteType, amountFor, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals(
      "Voter",
      sender.toHexString(),
      "totalVotes",
      amountFor.times(BigInt.fromI32(3)).plus(amountAgainst).toString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesFor",
      amountFor.times(BigInt.fromI32(3)).toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "voter",
      sender.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainstAmount",
      amountAgainst.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteForAmount",
      amountFor.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteAgainstAmount",
      "0"
    );

    voteType = getEnumBigInt(VoteType.TREASURY);

    event = createVoted(proposalId, sender, voteType, amountFor, isVoteFor, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals(
      "Voter",
      sender.toHexString(),
      "totalVotes",
      amountFor.times(BigInt.fromI32(4)).plus(amountAgainst).toString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesFor",
      amountFor.times(BigInt.fromI32(4)).toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "pool",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "voter",
      sender.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVoteAgainstAmount",
      amountAgainst.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteForAmount",
      amountFor.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteAgainstAmount",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalTreasuryVoteForAmount",
      amountFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalTreasuryVoteAgainstAmount",
      "0"
    );
  });

  test("should handle ProposalExecuted", () => {
    let proposalId = BigInt.fromI32(1);
    let isFor = true;
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createProposalExecuted(proposalId, isFor, sender, contractSender, block, tx);

    onProposalExecuted(event);

    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "isFor", "true");
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executor",
      sender.toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executionTimestamp",
      block.timestamp.toString()
    );

    proposalId = BigInt.fromI32(2);
    isFor = false;
    event = createProposalExecuted(proposalId, isFor, sender, contractSender, block, tx);

    onProposalExecuted(event);

    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "isFor", "false");
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executor",
      sender.toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "executionTimestamp",
      block.timestamp.toString()
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

    let event0 = createRewardClaimed(proposalIds[0], sender, tokens[0], amounts[0], contractSender, block, tx);
    let event1 = createRewardClaimed(proposalIds[1], sender, tokens[1], amounts[1], contractSender, block, tx);

    onRewardClaimed(event0);

    assert.fieldEquals("Voter", sender.toHexString(), "totalClaimedUSD", amounts[0].toString());
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "claimedRewardUSD",
      amounts[0].toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      amounts[0].toString()
    );

    onRewardClaimed(event1);

    assert.fieldEquals("Voter", sender.toHexString(), "totalClaimedUSD", amounts[0].plus(amounts[1]).toString());
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "claimedRewardUSD",
      amounts[1].toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      amounts[0].plus(amounts[1]).toString()
    );
  });

  test("should handle offchain RewardClaimed", () => {
    let proposalId = BigInt.zero();
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createRewardClaimed(proposalId, sender, rewardToken, amount, contractSender, block, tx);

    onRewardClaimed(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalClaimedUSD", "200");

    assert.fieldEquals("VoterOffchain", sender.concat(contractSender).toHexString(), "claimedRewardUSD", `200`);

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalClaimedUSD", "200");
  });

  test("should handle RewardCredited", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_CREATE),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalUnclaimedUSD", "200");

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDAgainst",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDFor",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");
  });

  test("should handle RewardCredited when reward type vote for/against", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_FOR),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDFor",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDAgainst",
      "0"
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalDelegationRewardUSDFor", "0");
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_AGAINST),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDFor",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDAgainst",
      "200"
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalDelegationRewardUSDFor", "0");
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");
  });

  test("should handle RewardCredited when reward type vote for/against delegated", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_FOR_DELEGATED),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDAgainst",
      "0"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");

    event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_AGAINST_DELEGATED),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardFromDelegationsUSDAgainst",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedRewardUSDAgainst",
      "200"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDFor",
      "200"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalDelegationRewardUSDAgainst",
      "200"
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposalsCount", "1");
  });

  test("should handle offchain RewardCredited", () => {
    let proposalId = BigInt.zero();
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_AGAINST_DELEGATED),
      rewardToken,
      amount,
      sender,
      contractSender,
      block,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalUnclaimedUSD", "200");

    assert.fieldEquals("VoterOffchain", sender.concat(contractSender).toHexString(), "rewardUSD", "200");
    assert.fieldEquals("VoterOffchain", sender.concat(contractSender).toHexString(), "claimedRewardUSD", "0");
  });

  test("should deposit", () => {
    let userKeeperAddress = Address.fromString("0x16e08f7d84603aeb97cd1c89a80a9e914f181676");
    getUserKeeperContract(userKeeperAddress, contractSender).save();

    let tokenAddress = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    let amount = BigInt.fromI32(1000);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let setTokenEvent = createSetERC20(tokenAddress, userKeeperAddress, block, tx);

    onSetERC20(setTokenEvent);

    let event = createDeposited(amount, [], sender, contractSender, block, tx);

    onDeposited(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalLockedFundsUSD", "200");

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalLockedFundsUSD", "200");
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "APR", "0");
  });

  test("should withdrawn", () => {
    let userKeeperAddress = Address.fromString("0x16e08f7d84603aeb97cd1c89a80a9e914f181676");
    getUserKeeperContract(userKeeperAddress, contractSender).save();

    let tokenAddress = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    let amount1 = BigInt.fromI32(1000);
    let amount2 = BigInt.fromI32(500);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let setTokenEvent = createSetERC20(tokenAddress, userKeeperAddress, block, tx);

    onSetERC20(setTokenEvent);

    let event1 = createDeposited(amount1, [], sender, contractSender, block, tx);

    onDeposited(event1);

    let event2 = createWithdrawn(amount2, [], sender, contractSender, block, tx);

    onWithdrawn(event2);

    assert.fieldEquals("Voter", sender.toHexString(), "totalLockedFundsUSD", "100");

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalLockedFundsUSD", "100");
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "APR", "0");
  });

  test("dao apr flow", () => {
    let userKeeperAddress = Address.fromString("0x16e08f7d84603aeb97cd1c89a80a9e914f181676");
    getUserKeeperContract(userKeeperAddress, contractSender).save();

    let tokenAddress = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    let amount1 = BigInt.fromI32(1000);
    let amount2 = BigInt.fromI32(3000);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let proposalId = BigInt.fromI32(1);
    let rewardToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181676");

    let setTokenEvent = createSetERC20(tokenAddress, userKeeperAddress, block, tx);

    onSetERC20(setTokenEvent);

    let event1 = createDeposited(amount1, [], sender, contractSender, block, tx);
    onDeposited(event1);

    let block4000 = getBlock(BigInt.fromI32(4000), BigInt.fromI32(4000));

    let event = createRewardCredited(
      proposalId,
      BigInt.fromI32(REWARD_TYPE_VOTE_FOR),
      rewardToken,
      amount2,
      sender,
      contractSender,
      block4000,
      tx
    );

    onRewardCredited(event);

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "APR", "591447861");
  });

  test("should handle StakingRewardClaimed event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let token = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    let amount = BigInt.fromI32(3000);

    let event = createStakingRewardClaimed(user, token, amount, contractSender, block, tx);

    onStakingRewardClaimed(event);

    assert.fieldEquals("Voter", user.toHexString(), "totalClaimedUSD", "1500");
    assert.fieldEquals("VoterInPool", user.concat(contractSender).toHexString(), "totalStakingReward", "1500");

    onStakingRewardClaimed(event);

    assert.fieldEquals("Voter", user.toHexString(), "totalClaimedUSD", amount.toString());
    assert.fieldEquals("VoterInPool", user.concat(contractSender).toHexString(), "totalStakingReward", "3000");
  });

  test("should handle OffchainResultsSaved event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let resultsHash = "hash1";

    let event = createOffchainResultsSaved(user, resultsHash, contractSender, block, tx);

    onOffchainResultsSaved(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "offchainResultsHash", resultsHash);

    resultsHash = "hash2";
    event = createOffchainResultsSaved(user, resultsHash, contractSender, block, tx);

    onOffchainResultsSaved(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "offchainResultsHash", resultsHash);
  });

  test("should handle OffchainResultsSaved event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let resultsHash = "hash1";

    let event = createOffchainResultsSaved(user, resultsHash, contractSender, block, tx);

    onOffchainResultsSaved(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "offchainResultsHash", resultsHash);

    resultsHash = "hash2";
    event = createOffchainResultsSaved(user, resultsHash, contractSender, block, tx);

    onOffchainResultsSaved(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "offchainResultsHash", resultsHash);
  });

  test("should handle Requested event", () => {
    let pool = getDaoPool(contractSender);
    pool.erc20Token = Bytes.fromHexString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    pool.save();

    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");

    let amount = BigInt.fromI32(1000);
    let nfts = [BigInt.fromI32(1)];

    let delegatedEvent = createDelegated(from, to, amount, nfts, true, contractSender, block, tx);

    onDelegated(delegatedEvent);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegated", `[${nfts[0]}]`);
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "1");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedDelegation", amount.toString());
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegation", `[${nfts[0]}]`);
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedTokensAmount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNft", `[]`);
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNftCount", `0`);
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "timestamp",
      delegatedEvent.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "from", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "to", to.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "nfts", `[${nfts[0]}]`);
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "type",
      DelegationType.DELEGATE.toString()
    );

    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "from",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateAmount",
      amount.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateNfts",
      `[${nfts[0]}]`
    );
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "requestAmount", "0");
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "requestNfts", `[]`);

    let event = createRequested(from, to, amount, nfts, contractSender, block, tx);

    onRequested(event);

    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "requestedTokensAmount",
      amount.toString()
    );
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNft", `[${nfts[0]}]`);
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNftCount", `1`);
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "timestamp",
      event.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "from", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "to", to.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "nfts", `[${nfts[0]}]`);
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "type",
      DelegationType.REQUEST.toString()
    );

    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "from",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateAmount",
      amount.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegateNfts",
      `[${nfts[0]}]`
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "requestAmount",
      amount.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "requestNfts",
      `[${nfts[0]}]`
    );

    let undelegatedEvent = createDelegated(from, to, amount, nfts, false, contractSender, block, tx);

    onDelegated(undelegatedEvent);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegated", `[]`);
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentTokenDelegatees", "0");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "totalCurrentNFTDelegatees", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedDelegation", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegation", `[]`);
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedTokensAmount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNft", `[]`);
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "requestedNftCount", `0`);
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(2).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(2).toHexString(),
      "timestamp",
      undelegatedEvent.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(2).toHexString(), "from", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(2).toHexString(), "to", to.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(2).toHexString(), "amount", amount.toString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(2).toHexString(), "nfts", `[${nfts[0]}]`);
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(2).toHexString(),
      "type",
      DelegationType.UNDELEGATE.toString()
    );

    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "from",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "to",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "delegateAmount", "0");
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "delegateNfts", `[]`);
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "requestAmount", "0");
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "requestNfts", `[]`);
  });
});
