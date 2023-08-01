import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, describe, newMockEvent, test } from "matchstick-as";
import { assertTransaction, getBlock, getNextTx, getTransaction } from "./utils";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";
import { getTraderPool } from "../src/entities/trader-pool/TraderPool";
import { getProposalContract } from "../src/entities/trader-pool/ProposalContract";
import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalCreatedProposalLimitsStruct,
  ProposalSupplied,
  ProposalClaimed,
  ProposalRestrictionsChanged,
  ProposalInvested,
  ProposalConverted,
} from "../generated/templates/TraderPoolInvestProposal/TraderPoolInvestProposal";
import {
  onProposalClaimed,
  onProposalCreated,
  onProposalRestrictionsChanged,
  onProposalSupplied,
  onProposalWithdrawn,
  onProposalInvest,
  onProposalConverted,
} from "../src/mappings/TraderPoolInvestProposal";

function createProposalCreated(
  proposalId: BigInt,
  proposalLimits: ProposalCreatedProposalLimitsStruct,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("proposalLimits", ethereum.Value.fromTuple(proposalLimits)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalWithdrawn(
  proposalId: BigInt,
  user: Address,
  amount: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalWithdrawn {
  let event = changetype<ProposalWithdrawn>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalSupplied(
  proposalId: BigInt,
  user: Address,
  amounts: BigInt[],
  tokens: Address[],
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalSupplied {
  let event = changetype<ProposalSupplied>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("amounts", ethereum.Value.fromUnsignedBigIntArray(amounts)));
  event.parameters.push(new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

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

function createProposalClaimed(
  proposalId: BigInt,
  user: Address,
  amounts: BigInt[],
  tokens: Address[],
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalClaimed {
  let event = changetype<ProposalClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("amounts", ethereum.Value.fromUnsignedBigIntArray(amounts)));
  event.parameters.push(new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalConverted(
  proposalId: BigInt,
  user: Address,
  amount: BigInt,
  baseToken: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalConverted {
  let event = changetype<ProposalConverted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("baseToken", ethereum.Value.fromAddress(baseToken)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

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

describe("TraderPoolInvestProposal", () => {
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
    let proposalLimits = new ProposalCreatedProposalLimitsStruct();

    let event = createProposalCreated(proposalId, proposalLimits, sender, block, tx);

    onProposalCreated(event);

    assert.fieldEquals("InvestProposalCreate", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals("InvestProposalCreate", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals(
      "InvestProposalCreate",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(tx.hash, trader, block, `[${TransactionType.INVEST_PROPOSAL_CREATE}]`, BigInt.fromI32(1), pool);
  });

  test("should handle ProposalWithdrawn event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let amount = BigInt.fromI32(100).pow(18);

    let event = createProposalWithdrawn(proposalId, user, amount, sender, block, tx);

    onProposalWithdrawn(event);

    assert.fieldEquals("InvestProposalWithdraw", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals(
      "InvestProposalWithdraw",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("InvestProposalWithdraw", tx.hash.concatI32(0).toHexString(), "amount", amount.toString());
    assert.fieldEquals(
      "InvestProposalWithdraw",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.INVEST_PROPOSAL_WITHDRAW}]`,
      BigInt.fromI32(1),
      pool
    );
  });

  test("should handle ProposalSupplied event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let amounts = [BigInt.fromI32(100).pow(18)];
    let tokens = [Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e014f181670")];

    let event = createProposalSupplied(proposalId, user, amounts, tokens, sender, block, tx);

    onProposalSupplied(event);

    assert.fieldEquals("InvestProposalClaimOrSupply", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("InvestProposalClaimOrSupply", tx.hash.concatI32(0).toHexString(), "amounts", `[${amounts[0]}]`);
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "tokens",
      `[${tokens[0].toHexString()}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.INVEST_PROPOSAL_SUPPLY}]`,
      BigInt.fromI32(1),
      pool
    );

    const nextTx = getNextTx(tx);

    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createProposalSupplied(proposalId, user, amounts, tokens, sender, block, nextTx);

    onProposalSupplied(event);

    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "pool",
      pool.toHexString()
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "amounts",
      `[${amounts[0]}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "tokens",
      `[${tokens[0].toHexString()}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "transaction",
      nextTx.hash.toHexString()
    );

    assertTransaction(
      nextTx.hash,
      event.params.sender,
      block,
      `[${TransactionType.INVEST_PROPOSAL_SUPPLY}]`,
      BigInt.fromI32(1),
      pool
    );
  });

  test("should handle ProposalClaimed event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let amounts = [BigInt.fromI32(100).pow(18)];
    let tokens = [Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e014f181670")];

    let event = createProposalClaimed(proposalId, user, amounts, tokens, sender, block, tx);

    onProposalClaimed(event);

    assert.fieldEquals("InvestProposalClaimOrSupply", tx.hash.concatI32(0).toHexString(), "pool", pool.toHexString());
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals("InvestProposalClaimOrSupply", tx.hash.concatI32(0).toHexString(), "amounts", `[${amounts[0]}]`);
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "tokens",
      `[${tokens[0].toHexString()}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.INVEST_PROPOSAL_CLAIM}]`,
      BigInt.fromI32(1),
      pool
    );

    const nextTx = getNextTx(tx);

    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createProposalClaimed(proposalId, user, amounts, tokens, sender, block, nextTx);

    onProposalClaimed(event);

    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "pool",
      pool.toHexString()
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "amounts",
      `[${amounts[0]}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "tokens",
      `[${tokens[0].toHexString()}]`
    );
    assert.fieldEquals(
      "InvestProposalClaimOrSupply",
      nextTx.hash.concatI32(0).toHexString(),
      "transaction",
      nextTx.hash.toHexString()
    );

    assertTransaction(
      nextTx.hash,
      event.params.user,
      block,
      `[${TransactionType.INVEST_PROPOSAL_CLAIM}]`,
      BigInt.fromI32(1),
      pool
    );
  });

  test("should handle ProposalInvested", () => {
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
      `[${TransactionType.INVEST_PROPOSAL_INVEST}]`,
      BigInt.fromI32(1),
      pool
    );
  });

  test("should handle ProposalConverted", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let amount = BigInt.fromI32(10).pow(18);
    let baseToken = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let event = createProposalConverted(proposalId, user, amount, baseToken, sender, block, tx);

    onProposalConverted(event);

    assert.fieldEquals(
      "InvestProposalConvertToDividends",
      tx.hash.concatI32(0).toHexString(),
      "proposalId",
      proposalId.toString()
    );
    assert.fieldEquals(
      "InvestProposalConvertToDividends",
      tx.hash.concatI32(0).toHexString(),
      "pool",
      pool.toHexString()
    );
    assert.fieldEquals(
      "InvestProposalConvertToDividends",
      tx.hash.concatI32(0).toHexString(),
      "amount",
      amount.toString()
    );
    assert.fieldEquals(
      "InvestProposalConvertToDividends",
      tx.hash.concatI32(0).toHexString(),
      "token",
      baseToken.toHexString()
    );
    assert.fieldEquals(
      "InvestProposalConvertToDividends",
      tx.hash.concatI32(0).toHexString(),
      "transaction",
      tx.hash.toHexString()
    );

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.INVEST_PROPOSAL_CONVERT_TO_DIVIDENDS}]`,
      BigInt.fromI32(1),
      pool
    );
  });

  test("should handle ProposalRestrictionsChanged", () => {
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
      `[${TransactionType.INVEST_PROPOSAL_EDIT}]`,
      BigInt.fromI32(1),
      pool
    );
  });
});
