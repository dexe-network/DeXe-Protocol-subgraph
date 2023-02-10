import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
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
} from "matchstick-as";
import {
  ProposalActivePortfolioExchanged,
  ProposalCreated,
  ProposalCreatedProposalLimitsStruct,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
  ProposalPositionClosed,
  ProposalRestrictionsChanged,
} from "../generated/templates/RiskyProposal/RiskyProposal";
import { getBlock, getTransaction } from "./utils";
import {
  onProposalActivePortfolioExchanged,
  onProposalCreated,
  onProposalExchange,
  onProposalPositionClosed,
} from "../src/mappings/TraderPoolRiskyProposal";
import { getBasicTraderPool } from "../src/entities/basic-pool/BasicTraderPool";
import { getProposalContract } from "../src/entities/basic-pool/proposal/ProposalContract";
import { getProposal } from "../src/entities/basic-pool/proposal/Proposal";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";

function createProposalCreated(
  proposalId: BigInt,
  token: Address,
  proposalLimits: ProposalCreatedProposalLimitsStruct,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("proposalLimits", ethereum.Value.fromTuple(proposalLimits)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalExchanged(
  proposalId: BigInt,
  user: Address,
  fromToken: Address,
  toToken: Address,
  fromVolume: BigInt,
  toVolume: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalExchanged {
  let event = changetype<ProposalExchanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("fromToken", ethereum.Value.fromAddress(fromToken)));
  event.parameters.push(new ethereum.EventParam("toToken", ethereum.Value.fromAddress(toToken)));
  event.parameters.push(new ethereum.EventParam("fromVolume", ethereum.Value.fromUnsignedBigInt(fromVolume)));
  event.parameters.push(new ethereum.EventParam("toVolume", ethereum.Value.fromUnsignedBigInt(toVolume)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createProposalPositionClosed(
  proposalId: BigInt,
  positionToken: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalPositionClosed {
  let event = changetype<ProposalPositionClosed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("positionToken", ethereum.Value.fromAddress(positionToken)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createProposalActivePortfolioExchanged(
  proposalId: BigInt,
  fromToken: Address,
  toToken: Address,
  fromVolume: BigInt,
  toVolume: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalActivePortfolioExchanged {
  let event = changetype<ProposalActivePortfolioExchanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("fromToken", ethereum.Value.fromAddress(fromToken)));
  event.parameters.push(new ethereum.EventParam("toToken", ethereum.Value.fromAddress(toToken)));
  event.parameters.push(new ethereum.EventParam("fromVolume", ethereum.Value.fromUnsignedBigInt(fromVolume)));
  event.parameters.push(new ethereum.EventParam("toVolume", ethereum.Value.fromUnsignedBigInt(toVolume)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
const proposalId = BigInt.fromI32(1);
const pool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
const expectedUSD = BigInt.fromI32(10).pow(18);

describe("TraderPoolRiskyProposal", () => {
  beforeAll(() => {
    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181979")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);
  });

  beforeEach(() => {
    let traderPool = getBasicTraderPool(pool);
    traderPool.save();
    let proposal = getProposalContract(sender, pool);
    proposal.save();
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle ProposalCreated event", () => {
    let token = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");
    let proposalLimits = new ProposalCreatedProposalLimitsStruct(3);
    proposalLimits[0] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1));
    proposalLimits[1] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2));
    proposalLimits[2] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3));

    let event = createProposalCreated(proposalId, token, proposalLimits, sender, block, tx);

    onProposalCreated(event);

    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "basicPool", pool.toHexString());
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "token", token.toHexString());
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "proposalId", proposalId.toString());
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "timestampLimit", "1");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "investLPLimit", "2");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "maxTokenPriceLimit", "3");
  });

  test("should handle ProposalExchanged event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let fromToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(100).pow(18);
    let toVolume = BigInt.fromI32(10).pow(18);

    let proposalContract = getProposalContract(sender);
    getProposal(proposalId, proposalContract, fromToken, BigInt.zero(), BigInt.zero()).save();

    let event = createProposalExchanged(proposalId, user, fromToken, toToken, fromVolume, toVolume, sender, block, tx);

    onProposalExchange(event);

    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "fromToken", fromToken.toHexString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "toToken", toToken.toHexString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "fromVolume", fromVolume.toString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "toVolume", toVolume.toString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "usdVolume", expectedUSD.toString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "timestamp", block.timestamp.toString());
    assert.fieldEquals("ProposalExchange", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());

    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalPositionCloseVolume",
      fromVolume.toString()
    );
    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalBaseCloseVolume",
      toVolume.toString()
    );
    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalUSDCloseVolume",
      expectedUSD.toString()
    );
    assert.fieldEquals("InteractionCount", tx.hash.toHexString(), "count", "1");
  });

  test("should handle ProposalPositionClosed event", () => {
    let token = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");

    let event = createProposalPositionClosed(proposalId, token, sender, block, tx);

    onProposalPositionClosed(event);

    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "isClosed",
      "true"
    );
    assert.fieldEquals("ProposalPositionOffset", sender.toHexString() + proposalId.toString(), "offset", "1");
  });

  test("should handle ProposalActivePortfolioExchanged", () => {
    let fromToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(100).pow(18);
    let toVolume = BigInt.fromI32(10).pow(18);

    let proposalContract = getProposalContract(sender);
    getProposal(proposalId, proposalContract, fromToken, BigInt.zero(), BigInt.zero()).save();

    let event = createProposalActivePortfolioExchanged(
      proposalId,
      fromToken,
      toToken,
      fromVolume,
      toVolume,
      sender,
      block,
      tx
    );

    onProposalActivePortfolioExchanged(event);

    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalPositionCloseVolume",
      fromVolume.toString()
    );
    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalBaseCloseVolume",
      toVolume.toString()
    );
    assert.fieldEquals(
      "ProposalPosition",
      sender.toHexString() + proposalId.toString() + "_" + "0",
      "totalUSDCloseVolume",
      expectedUSD.toString()
    );
  });
});
