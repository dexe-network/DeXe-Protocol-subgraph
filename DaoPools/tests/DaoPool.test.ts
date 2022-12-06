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
  DPCreated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  RewardCredited,
  Voted,
} from "../generated/templates/DaoPool/DaoPool";
import {
  onDelegated,
  onDPCreated,
  onProposalCreated,
  onProposalExecuted,
  onVoted,
  onRewardClaimed,
  onRewardCredited,
} from "../src/mappings/DaoPool";
import { ProposalType } from "../src/entities/global/ProposalTypes";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";
import { ProposalSettings } from "../generated/schema";

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

function createRewardCredited(
  proposalId: BigInt,
  amount: BigInt,
  sender: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): RewardCredited {
  let event = changetype<RewardCredited>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
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
      "misc",
      contractSender,
      block,
      tx
    );

    onProposalCreated(event);

    assert.fieldEquals("DaoPool", contractSender.toHexString(), "votersCount", "0");
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
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "currentVotes", "0");
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
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "misc", "misc");
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "proposalCount", "1");
  });

  test("should handle Delegated", () => {
    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount = BigInt.fromI32(100).pow(18);
    let nfts = [BigInt.fromI32(1), BigInt.fromI32(2)];

    let event = createDelegated(from, to, amount, nfts, true, contractSender, block, tx);

    onDelegated(event);

    assert.fieldEquals("Voter", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Voter", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("DaoPool", contractSender.toHexString(), "votersCount", "2");
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "receivedDelegation", amount.toString());
    assert.fieldEquals(
      "VoterInPool",
      to.concat(contractSender).toHexString(),
      "receivedNFTDelegation",
      "[" + nfts[0].toString() + ", " + nfts[1].toString() + "]"
    );
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");

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
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(0).toHexString(),
      "nfts",
      "[" + nfts[0].toString() + ", " + nfts[1].toString() + "]"
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(0).toHexString(), "isDelegate", "true");

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
      "[" + nfts[0].toString() + ", " + nfts[1].toString() + "]"
    );
  });

  test("should handle Undelegated", () => {
    let from = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let to = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let amount1 = BigInt.fromI32(100).pow(18);
    let amount2 = BigInt.fromI32(50).pow(18);
    let nfts1 = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let nfts2 = [BigInt.fromI32(1)];

    let event1 = createDelegated(from, to, amount1, nfts1, true, contractSender, block, tx);
    let event2 = createDelegated(from, to, amount2, nfts2, false, contractSender, block, tx);

    onDelegated(event1);
    onDelegated(event2);

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
      "[" + nfts1[1].toString() + "]"
    );
    assert.fieldEquals("VoterInPool", to.concat(contractSender).toHexString(), "currentDelegatorsCount", "1");

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
    assert.fieldEquals(
      "DelegationHistory",
      tx.hash.concatI32(1).toHexString(),
      "nfts",
      "[" + nfts2[0].toString() + "]"
    );
    assert.fieldEquals("DelegationHistory", tx.hash.concatI32(1).toHexString(), "isDelegate", "false");

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
      "[" + nfts1[1].toString() + "]"
    );
  });

  test("should handle voted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let personalVote = BigInt.fromI32(1000);
    let delegatedVote = BigInt.fromI32(100);

    let event = createVoted(proposalId, sender, personalVote, delegatedVote, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals(
      "Proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "currentVotes",
      personalVote.plus(delegatedVote).toString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "votersVoted", "1");
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
      "totalVoteAmount",
      personalVote.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "totalDelegatedVoteAmount",
      delegatedVote.toString()
    );
    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "claimedReward",
      BigInt.zero().toString()
    );
  });

  test("should handle DPCreated", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let token = Address.fromString("0x16e08f7d84603AEb97cd1c89A80A9e914f181671");
    let amount = BigInt.fromI32(100).pow(18);

    let event = createDPCreated(proposalId, sender, token, amount, contractSender, block, tx);

    onDPCreated(event);

    assert.fieldEquals(
      "DistributionProposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "token",
      token.toHexString()
    );
    assert.fieldEquals(
      "DistributionProposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "amount",
      amount.toString()
    );
    assert.fieldEquals(
      "DistributionProposal",
      contractSender.concatI32(proposalId.toI32()).toHexString(),
      "proposal",
      contractSender.concatI32(proposalId.toI32()).toHexString()
    );
    assert.fieldEquals("Proposal", contractSender.concatI32(proposalId.toI32()).toHexString(), "isDP", "true");
  });

  test("should handle ProposalExecuted", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createProposalExecuted(proposalId, sender, contractSender, block, tx);

    onProposalExecuted(event);

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

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[0].toI32()).toHexString(),
      "claimedReward",
      amounts[0].toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      amounts[0].toString()
    );

    onRewardClaimed(event1);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalIds[1].toI32()).toHexString(),
      "claimedReward",
      amounts[1].toString()
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(contractSender).toHexString(),
      "totalClaimedUSD",
      amounts[0].plus(amounts[1]).toString()
    );
  });

  test("should handle RewardCredited", () => {
    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let amount = BigInt.fromI32(1000);

    let event = createRewardCredited(proposalId, amount, sender, contractSender, block, tx);

    onRewardCredited(event);

    assert.fieldEquals(
      "VoterInProposal",
      sender.concat(contractSender).concatI32(proposalId.toI32()).toHexString(),
      "unclaimedReward",
      amount.toString()
    );
  });
});
