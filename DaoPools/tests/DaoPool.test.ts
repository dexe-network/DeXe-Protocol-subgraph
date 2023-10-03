import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
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
  VoteChanged,
  OffchainResultsSaved,
  DelegatedTreasury,
  DelegatorRewardsClaimed,
  QuorumReached,
  VotingRewardClaimed,
  QuorumUnreached,
} from "../generated/templates/DaoPool/DaoPool";
import {
  onDelegated,
  onProposalCreated,
  onProposalExecuted,
  onVoteChanged,
  onRewardClaimed,
  onDeposited,
  onWithdrawn,
  onOffchainResultsSaved,
  onDelegatedTreasury,
  onDelegatorRewardsClaimed,
  onQuorumReached,
  onVotingRewardClaimed,
  onQuorumUnreached,
} from "../src/mappings/DaoPool";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";
import { ProposalSettings } from "../generated/schema";
import { createSetERC20 } from "./UserKeeper.test";
import { getUserKeeperContract } from "../src/entities/UserKeeperContract";
import { onSetERC20 } from "../src/mappings/UserKeeper";
import { DelegationType } from "../src/entities/global/DelegationTypeEnum";
import { getDaoPool } from "../src/entities/DaoPool";
import { TreasuryDelegationType } from "../src/entities/global/TreasuryDelegationTypeEnum";
import { RewardType } from "../src/entities/global/RewardTypeEnum";

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

function createVoteChanged(
  proposalId: BigInt,
  sender: Address,
  totalVoted: BigInt,
  isVoteFor: boolean,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): VoteChanged {
  let event = changetype<VoteChanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("voter", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("isVoteFor", ethereum.Value.fromBoolean(isVoteFor)));
  event.parameters.push(new ethereum.EventParam("totalVoted", ethereum.Value.fromUnsignedBigInt(totalVoted)));

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
  event.parameters.push(new ethereum.EventParam("rewards", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createVotingRewardClaimed(
  proposalId: BigInt,
  sender: Address,
  token: Address,
  personalAmount: BigInt,
  micropoolAmount: BigInt,
  treasuryAmount: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): VotingRewardClaimed {
  let event = changetype<VotingRewardClaimed>(newMockEvent());
  event.parameters = new Array();

  const rewards = new ethereum.Tuple(3);

  rewards[0] = ethereum.Value.fromUnsignedBigInt(personalAmount);
  rewards[1] = ethereum.Value.fromUnsignedBigInt(micropoolAmount);
  rewards[2] = ethereum.Value.fromUnsignedBigInt(treasuryAmount);

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("rewards", ethereum.Value.fromTuple(rewards)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createQuorumReached(
  proposalId: BigInt,
  timestamp: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): QuorumReached {
  let event = changetype<QuorumReached>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(timestamp)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createQuorumUnreached(
  proposalId: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): QuorumUnreached {
  let event = changetype<QuorumUnreached>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));

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

function createDelegatorRewardsClaimed(
  proposalId: BigInt,
  delegator: Address,
  delegatee: Address,
  amount: BigInt,
  token: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DelegatorRewardsClaimed {
  let event = changetype<DelegatorRewardsClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("delegator", ethereum.Value.fromAddress(delegator)));
  event.parameters.push(new ethereum.EventParam("delegatee", ethereum.Value.fromAddress(delegatee)));
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

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const settingsId = BigInt.fromI32(2);

const USER_KEEPER_ADDRESS = "0x96e08f7d84603AEb97cd1c89A80A9e914f181670";

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

    createMockedFunction(
      Address.fromString(USER_KEEPER_ADDRESS),
      "nftVotingPower",
      "nftVotingPower(uint256[],bool):(uint256,uint256[])"
    )
      .withArgs([ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(1)]), ethereum.Value.fromBoolean(false)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1500)), ethereum.Value.fromUnsignedBigIntArray([])]);

    createMockedFunction(
      Address.fromString(USER_KEEPER_ADDRESS),
      "nftVotingPower",
      "nftVotingPower(uint256[],bool):(uint256,uint256[])"
    )
      .withArgs([
        ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(1), BigInt.fromI32(2)]),
        ethereum.Value.fromBoolean(false),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(3000)), ethereum.Value.fromUnsignedBigIntArray([])]);

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
    pool.userKeeper = Bytes.fromHexString(USER_KEEPER_ADDRESS);
    pool.save();

    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount = BigInt.fromI32(1000);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];

    let event = createDelegated(from, to, amount, nfts, true, contractSender, block, tx);

    onDelegated(event);

    assert.fieldEquals("Voter", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Voter", from.toHexString(), "totalDelegatedUSD", "200");
    assert.fieldEquals("Voter", from.toHexString(), "currentVotesDelegated", "4000");
    assert.fieldEquals("Voter", from.toHexString(), "currentVotesReceived", "0");
    assert.fieldEquals("Voter", from.toHexString(), "delegateesCount", "1");
    assert.fieldEquals("Voter", from.toHexString(), "delegatorsCount", "0");
    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("Voter", to.toHexString(), "delegateesCount", "0");
    assert.fieldEquals("Voter", to.toHexString(), "delegatorsCount", "1");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesDelegated", "0");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesReceived", "4000");
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
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegateesCount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "2");
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "joinedTimestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals("VoterInPool", from.concat(contractSender).toHexString(), "currentDelegateesCount", "1");
    assert.fieldEquals("VoterInPool", from.concat(contractSender).toHexString(), "currentDelegatorsCount", "0");
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
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "delegator", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "delegatee", to.toHexString());
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
      "creationTimestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegator",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatee",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedVotes",
      "4000"
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedAmount",
      amount.toString()
    );
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "delegatedUSD", "200");
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedNfts",
      `[${nfts[0]}, ${nfts[1]}]`
    );
  });

  test("should handle Undelegated", () => {
    let pool = getDaoPool(contractSender);
    pool.erc20Token = Bytes.fromHexString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    pool.userKeeper = Bytes.fromHexString(USER_KEEPER_ADDRESS);
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

    assert.fieldEquals("Voter", from.toHexString(), "currentVotesDelegated", "4000");
    assert.fieldEquals("Voter", from.toHexString(), "currentVotesReceived", "0");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesDelegated", "0");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesReceived", "4000");
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedVotes",
      "4000"
    );

    onDelegated(event2);

    assert.fieldEquals("Voter", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Voter", from.toHexString(), "totalDelegatedUSD", "100");
    assert.fieldEquals("Voter", from.toHexString(), "delegateesCount", "1");
    assert.fieldEquals("Voter", from.toHexString(), "delegatorsCount", "0");
    assert.fieldEquals("Voter", from.toHexString(), "currentVotesDelegated", "2000");
    assert.fieldEquals("Voter", from.toHexString(), "currentVotesReceived", "0");
    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("Voter", to.toHexString(), "delegateesCount", "0");
    assert.fieldEquals("Voter", to.toHexString(), "delegatorsCount", "1");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesDelegated", "0");
    assert.fieldEquals("Voter", to.toHexString(), "currentVotesReceived", "2000");
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
    assert.fieldEquals("VoterInPool", from.concat(contractSender).toHexString(), "currentDelegateesCount", "1");
    assert.fieldEquals("VoterInPool", from.concat(contractSender).toHexString(), "currentDelegatorsCount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegateesCount", "0");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedNFTDelegationCount", "1");
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "pool", contractSender.toHexString());
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "timestamp",
      event2.block.timestamp.toString()
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "delegator", from.toHexString());
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "delegatee", to.toHexString());
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
      "creationTimestamp",
      block.timestamp.toString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegator",
      from.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatee",
      to.concat(contractSender).toHexString()
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedVotes",
      "2000"
    );
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedAmount",
      amount1.minus(amount2).toString()
    );
    assert.fieldEquals("VoterInPoolPair", contractSender.concat(from).concat(to).toHexString(), "delegatedUSD", "100");
    assert.fieldEquals(
      "VoterInPoolPair",
      contractSender.concat(from).concat(to).toHexString(),
      "delegatedNfts",
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
      "delegatee",
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
      "delegatee",
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

  test("should handle VoteChanged", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let votedFor = BigInt.fromI32(1000);
    let isVoteFor = true;

    let event = createVoteChanged(proposalId, sender, votedFor, isVoteFor, contractSender, block, tx);

    onVoteChanged(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals("Voter", sender.toHexString(), "totalVotes", votedFor.toString());
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesFor",
      votedFor.toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "engagedProposalsCount", "1");

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
      "isVoteFor",
      isVoteFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVote",
      votedFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      "0"
    );

    let votedAgainst = BigInt.fromI32(200);

    isVoteFor = false;
    sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");

    let nextTx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

    event = createVoteChanged(proposalId, sender, votedAgainst, isVoteFor, contractSender, block, nextTx);

    onVoteChanged(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "1");
    assert.fieldEquals("Voter", sender.toHexString(), "totalVotes", votedAgainst.toString());
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesAgainst",
      votedAgainst.toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "2");

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "proposals",
      `[${sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "engagedProposalsCount", "1");

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
      "isVoteFor",
      isVoteFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVote",
      votedAgainst.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      "0"
    );

    nextTx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

    event = createVoteChanged(proposalId, sender, BigInt.zero(), isVoteFor, contractSender, block, nextTx);

    onVoteChanged(event);

    assert.fieldEquals("Voter", sender.toHexString(), "totalVotedProposals", "0");
    assert.fieldEquals("Voter", sender.toHexString(), "totalVotes", "0");
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotesAgainst",
      "0"
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "proposals", `[]`);
    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "engagedProposalsCount", "0");

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
      "isVoteFor",
      isVoteFor.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalVote",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      "0"
    );
  });

  test("should handle QuorumReached", () => {
    let proposalId = BigInt.fromI32(1);

    let event = createQuorumReached(proposalId, block.timestamp, contractSender, block, tx);

    onQuorumReached(event);

    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "id",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "quorumReachedTimestamp",
      block.timestamp.toString()
    );
  });

  test("should handle QuorumUnreached", () => {
    let proposalId = BigInt.fromI32(1);

    let reachedEvent = createQuorumReached(proposalId, block.timestamp, contractSender, block, tx);

    onQuorumReached(reachedEvent);

    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "id",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "quorumReachedTimestamp",
      block.timestamp.toString()
    );

    let unreachedEvent = createQuorumUnreached(proposalId, contractSender, block, tx);

    onQuorumUnreached(unreachedEvent);

    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "id",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "quorumReachedTimestamp",
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

  test("should handle DelegatorRewardsClaimed", () => {
    let proposalId = BigInt.fromI32(1);
    let delegator = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let delegatee = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let token = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181676");
    let amount = BigInt.fromI32(1000);

    let event = createDelegatorRewardsClaimed(
      proposalId,
      delegator,
      delegatee,
      amount,
      token,
      contractSender,
      block,
      tx
    );

    onDelegatorRewardsClaimed(event);

    assert.fieldEquals("Voter", delegator.toHexString(), "totalMicropoolRewardUSD", "200");
    assert.fieldEquals("Voter", delegator.toHexString(), "totalClaimedUSD", "200");

    assert.fieldEquals(
      "VoterInProposal",
      delegator.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "micropoolRewardUSD",
      "200"
    );
    assert.fieldEquals(
      "VoterInProposal",
      delegator.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedRewardUSD",
      "200"
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
      "claimed",
      "true"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "staticRewardUSD",
      amounts[0].toString()
    );
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
      "claimed",
      "true"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "staticRewardUSD",
      amounts[1].toString()
    );
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

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalClaimedUSD", "200");
  });

  test("should handle VotingRewardClaimed", () => {
    let proposalIds = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let tokens = [
      Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672"),
      Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181673"),
    ];

    let personalAmount = BigInt.fromI32(10).pow(18);
    let micropoolAmount = BigInt.fromI32(10).pow(18);
    let treasuryAmount = BigInt.fromI32(10).pow(18);

    let totalAmount = personalAmount.plus(micropoolAmount).plus(treasuryAmount);

    let event0 = createVotingRewardClaimed(
      proposalIds[0],
      sender,
      tokens[0],
      personalAmount,
      micropoolAmount,
      treasuryAmount,
      contractSender,
      block,
      tx
    );

    onVotingRewardClaimed(event0);

    assert.fieldEquals("Voter", sender.toHexString(), "totalClaimedUSD", totalAmount.toString());
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "claimed",
      "true"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "staticRewardUSD",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "claimedRewardUSD",
      totalAmount.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "personalVotingRewardUSD",
      personalAmount.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "micropoolVotingRewardUSD",
      micropoolAmount.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "treasuryVotingRewardUSD",
      treasuryAmount.toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      totalAmount.toString()
    );

    let personalAmount1 = BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2));
    let micropoolAmount1 = BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2));
    let treasuryAmount1 = BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2));

    let totalAmount1 = personalAmount1.plus(micropoolAmount1).plus(treasuryAmount1);

    let event1 = createVotingRewardClaimed(
      proposalIds[1],
      sender,
      tokens[1],
      personalAmount1,
      micropoolAmount1,
      treasuryAmount1,
      contractSender,
      block,
      tx
    );

    onVotingRewardClaimed(event1);

    assert.fieldEquals("Voter", sender.toHexString(), "totalClaimedUSD", totalAmount.plus(totalAmount1).toString());
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "claimed",
      "true"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "staticRewardUSD",
      "0"
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "personalVotingRewardUSD",
      personalAmount1.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "micropoolVotingRewardUSD",
      micropoolAmount1.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "treasuryVotingRewardUSD",
      treasuryAmount1.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "claimedRewardUSD",
      totalAmount1.toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      totalAmount.plus(totalAmount1).toString()
    );
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

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalLockedUSD", "200");
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

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "totalLockedUSD", "100");
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

    let event = createRewardClaimed(proposalId, sender, rewardToken, amount2, contractSender, block4000, tx);

    onRewardClaimed(event);

    assert.fieldEquals("VoterInPool", sender.concat(contractSender).toHexString(), "APR", "591447861");
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
});
