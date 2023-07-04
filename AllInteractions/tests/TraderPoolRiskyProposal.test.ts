import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, describe, newMockEvent, test } from "matchstick-as";
import {
  ProposalCreated,
  ProposalCreatedProposalLimitsStruct,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
  ProposalRestrictionsChanged,
} from "../generated/templates/TraderPoolRiskyProposal/TraderPoolRiskyProposal";
import { assertTransaction, getBlock, getNextTx, getTransaction } from "./utils";
import {
  onProposalCreated,
  onProposalDivest,
  onProposalExchange,
  onProposalInvest,
  onProposalRestrictionsChanged,
} from "../src/mappings/TraderPoolRiskyProposal";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";
import { getTraderPool } from "../src/entities/trader-pool/TraderPool";
import { getProposalContract } from "../src/entities/trader-pool/ProposalContract";

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

function createProposalInvested(
  proposalId: BigInt,
  user: Address,
  investedLP: BigInt,
  investedBase: BigInt,
  receivedLP2: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalInvested {
  let event = changetype<ProposalInvested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("investedLP", ethereum.Value.fromUnsignedBigInt(investedLP)));
  event.parameters.push(new ethereum.EventParam("investedBase", ethereum.Value.fromUnsignedBigInt(investedBase)));
  event.parameters.push(new ethereum.EventParam("receivedLP2", ethereum.Value.fromUnsignedBigInt(receivedLP2)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createProposalDivested(
  proposalId: BigInt,
  user: Address,
  receivedLP: BigInt,
  receivedBase: BigInt,
  divestedLP2: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalDivested {
  let event = changetype<ProposalDivested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("receivedLP2", ethereum.Value.fromUnsignedBigInt(divestedLP2)));
  event.parameters.push(new ethereum.EventParam("investedLP", ethereum.Value.fromUnsignedBigInt(receivedLP)));
  event.parameters.push(new ethereum.EventParam("investedBase", ethereum.Value.fromUnsignedBigInt(receivedBase)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createProposalRestrictionsChanged(
  proposalId: BigInt,
  user: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalRestrictionsChanged {
  let event = changetype<ProposalRestrictionsChanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));

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
const trader = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181699");

describe("TraderPoolRiskyProposal", () => {
  beforeEach(() => {
    let traderPool = getTraderPool(pool, sender, trader);
    traderPool.save();
    let proposal = getProposalContract(sender, pool);
    proposal.save();
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle ProposalCreated event", () => {
    let token = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");
    let proposalLimits = new ProposalCreatedProposalLimitsStruct();

    let event = createProposalCreated(proposalId, token, proposalLimits, sender, block, tx);

    onProposalCreated(event);

    assert.fieldEquals("RiskyProposalCreate", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals("RiskyProposalCreate", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("RiskyProposalCreate", tx.hash.concatI32(0).toHexString(), "token", token.toHexString());
    assert.fieldEquals("RiskyProposalCreate", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, trader, block, `[${TransactionType.RISKY_PROPOSAL_CREATE}]`, BigInt.fromI32(1));
  });

  test("should handle ProposalExchanged event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let fromToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(100).pow(18);
    let toVolume = BigInt.fromI32(10).pow(18);

    let event = createProposalExchanged(proposalId, user, fromToken, toToken, fromVolume, toVolume, sender, block, tx);

    onProposalExchange(event);

    assert.fieldEquals(
      "RiskyProposalExchange",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("RiskyProposalExchange", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals(
      "RiskyProposalExchange",
      tx.hash.concatI32(0).toHexString(),
      "fromToken",
      fromToken.toHexString()
    );
    assert.fieldEquals("RiskyProposalExchange", tx.hash.concatI32(0).toHexString(), "toToken", toToken.toHexString());
    assert.fieldEquals(
      "RiskyProposalExchange",
      tx.hash.concatI32(0).toHexString(),
      "fromVolume",
      fromVolume.toString()
    );
    assert.fieldEquals("RiskyProposalExchange", tx.hash.concatI32(0).toHexString(), "toVolume", toVolume.toString());
    assert.fieldEquals(
      "RiskyProposalExchange",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(tx.hash, user, block, `[${TransactionType.RISKY_PROPOSAL_SWAP}]`, BigInt.fromI32(1));
  });

  test("should handle ProposalInvested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let investedLP = BigInt.fromI32(10).pow(18);
    let investedBase = BigInt.fromI32(100).pow(18);
    let receivedLP2 = BigInt.fromI32(50).pow(17);

    let event = createProposalInvested(proposalId, user, investedLP, investedBase, receivedLP2, sender, block, tx);

    onProposalInvest(event);

    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseAmount", investedBase.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Amount", receivedLP2.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.RISKY_PROPOSAL_INVEST}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle ProposalDivested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let receivedLP = BigInt.fromI32(10).pow(18);
    let receivedBase = BigInt.fromI32(100).pow(18);
    let divestedLP2 = BigInt.fromI32(50).pow(17);

    let event = createProposalDivested(proposalId, user, receivedLP, receivedBase, divestedLP2, sender, block, tx);

    onProposalDivest(event);

    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseAmount", receivedBase.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Amount", divestedLP2.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.RISKY_PROPOSAL_DIVEST}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle ProposalRestrictionsChanged event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let event = createProposalRestrictionsChanged(proposalId, user, sender, block, tx);

    onProposalRestrictionsChanged(event);

    assert.fieldEquals("ProposalEdit", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalEdit", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals("ProposalEdit", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.RISKY_PROPOSAL_EDIT}]`,
      BigInt.fromI32(1)
    );

    const nextTx = getNextTx(tx);
    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createProposalRestrictionsChanged(proposalId, user, sender, block, nextTx);

    onProposalRestrictionsChanged(event);

    assert.fieldEquals("ProposalEdit", nextTx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalEdit", nextTx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals(
      "ProposalEdit",
      nextTx.hash.concatI32(0).toHexString(),
      "transaction",
      nextTx.hash.toHexString()
    );

    assertTransaction(
      nextTx.hash,
      event.params.sender,
      block,
      `[${TransactionType.RISKY_PROPOSAL_EDIT}]`,
      BigInt.fromI32(1)
    );
  });
});
