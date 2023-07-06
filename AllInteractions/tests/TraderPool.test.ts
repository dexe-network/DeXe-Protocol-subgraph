import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as";
import {
  DescriptionURLChanged,
  Divested,
  Exchanged,
  Invested,
  ModifiedAdmins,
  ProposalDivested,
  ModifiedPrivateInvestors,
  CommissionClaimed,
} from "../generated/templates/TraderPool/TraderPool";
import { assertTransaction, getBlock, getNextTx, getTransaction } from "./utils";
import {
  onCommissionClaimed,
  onDescriptionURLChanged,
  onDivest,
  onExchange,
  onInvest,
  onModifiedAdmins,
  onModifiedPrivateInvestors,
  onProposalDivest,
} from "../src/mappings/TraderPool";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createExchangeEvent(
  user: Address,
  fromToken: Address,
  toToken: Address,
  fromVolume: BigInt,
  toVolume: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Exchanged {
  let event = changetype<Exchanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("fromToken", ethereum.Value.fromAddress(fromToken)));
  event.parameters.push(new ethereum.EventParam("toToken", ethereum.Value.fromAddress(toToken)));
  event.parameters.push(new ethereum.EventParam("fromVolume", ethereum.Value.fromUnsignedBigInt(fromVolume)));
  event.parameters.push(new ethereum.EventParam("toToken", ethereum.Value.fromUnsignedBigInt(toVolume)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createInvestedEvent(
  user: Address,
  investedBase: BigInt,
  receivedLP: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Invested {
  let event = changetype<Invested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("investedBase", ethereum.Value.fromUnsignedBigInt(investedBase)));
  event.parameters.push(new ethereum.EventParam("receivedLP", ethereum.Value.fromUnsignedBigInt(receivedLP)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createDivestedEvent(
  user: Address,
  receivedBase: BigInt,
  divestedLP: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Divested {
  let event = changetype<Divested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("divestedLP", ethereum.Value.fromUnsignedBigInt(divestedLP)));
  event.parameters.push(new ethereum.EventParam("receivedBase", ethereum.Value.fromUnsignedBigInt(receivedBase)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createDescriptionURLChanged(
  user: Address,
  descriptionURL: string,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DescriptionURLChanged {
  let event = changetype<DescriptionURLChanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("descriptionURL", ethereum.Value.fromString(descriptionURL)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalDivest(
  proposalId: BigInt,
  user: Address,
  divestedLP2: BigInt,
  receivedLP: BigInt,
  receivedBase: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalDivested {
  let event = changetype<ProposalDivested>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("divestedLP2", ethereum.Value.fromUnsignedBigInt(divestedLP2)));
  event.parameters.push(new ethereum.EventParam("receivedLP", ethereum.Value.fromUnsignedBigInt(receivedLP)));
  event.parameters.push(new ethereum.EventParam("receivedBase", ethereum.Value.fromUnsignedBigInt(receivedBase)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createModifiedPrivateInvestors(
  user: Address,
  privateInvestors: Address[],
  add: boolean,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ModifiedPrivateInvestors {
  let event = changetype<ModifiedPrivateInvestors>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("privateInvestors", ethereum.Value.fromAddressArray(privateInvestors)));
  event.parameters.push(new ethereum.EventParam("add", ethereum.Value.fromBoolean(add)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createModifiedAdmins(
  user: Address,
  admins: Address[],
  add: boolean,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ModifiedAdmins {
  let event = changetype<ModifiedAdmins>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("admins", ethereum.Value.fromAddressArray(admins)));
  event.parameters.push(new ethereum.EventParam("add", ethereum.Value.fromBoolean(add)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createCommissionClaimed(
  user: Address,
  traderLpClaimed: BigInt,
  traderBaseClaimed: BigInt,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): CommissionClaimed {
  let event = changetype<CommissionClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("traderLpClaimed", ethereum.Value.fromUnsignedBigInt(traderLpClaimed)));
  event.parameters.push(
    new ethereum.EventParam("traderLpClaimed", ethereum.Value.fromUnsignedBigInt(traderBaseClaimed))
  );

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");

describe("TraderPool", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle exchange event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let fromToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(100).pow(18);
    let toVolume = BigInt.fromI32(10).pow(18);

    let event = createExchangeEvent(user, fromToken, toToken, fromVolume, toVolume, sender, block, tx);

    onExchange(event);

    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "fromToken", fromToken.toHexString());
    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "toToken", toToken.toHexString());
    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "fromVolume", fromVolume.toString());
    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "toVolume", toVolume.toString());
    assert.fieldEquals("Exchange", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, event.params.sender, block, `[${TransactionType.SWAP}]`, BigInt.fromI32(1));
  });

  test("should handle invested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let investedBase = BigInt.fromI32(100).pow(18);
    let receivedLP = BigInt.fromI32(10).pow(18);

    let event = createInvestedEvent(user, investedBase, receivedLP, sender, block, tx);

    onInvest(event);

    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "baseAmount", investedBase.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "lpAmount", receivedLP.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, event.params.user, block, `[${TransactionType.INVEST}]`, BigInt.fromI32(1));

    const nextTx = getNextTx(tx);

    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");
    investedBase = BigInt.fromI32(50).pow(18);
    receivedLP = BigInt.fromI32(5).pow(18);

    event = createInvestedEvent(user, investedBase, receivedLP, sender, block, nextTx);

    onInvest(event);

    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "baseAmount", investedBase.toString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "lpAmount", receivedLP.toString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "transaction", nextTx.hash.toHexString());

    assertTransaction(nextTx.hash, event.params.user, block, `[${TransactionType.INVEST}]`, BigInt.fromI32(1));
  });

  test("should handle divested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let receivedBase = BigInt.fromI32(100).pow(18);
    let divestedLP = BigInt.fromI32(10).pow(18);

    let event = createDivestedEvent(user, receivedBase, divestedLP, sender, block, tx);

    onDivest(event);

    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "baseAmount", receivedBase.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "lpAmount", divestedLP.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, event.params.user, block, `[${TransactionType.DIVEST}]`, BigInt.fromI32(1));

    const nextTx = getNextTx(tx);

    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");
    receivedBase = BigInt.fromI32(50).pow(18);
    divestedLP = BigInt.fromI32(5).pow(18);

    event = createDivestedEvent(user, receivedBase, divestedLP, sender, block, nextTx);

    onDivest(event);

    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "baseAmount", receivedBase.toString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "lpAmount", divestedLP.toString());
    assert.fieldEquals("Vest", nextTx.hash.concatI32(0).toHexString(), "transaction", nextTx.hash.toHexString());

    assertTransaction(nextTx.hash, event.params.user, block, `[${TransactionType.DIVEST}]`, BigInt.fromI32(1));
  });

  test("should handle DescriptionURLChanged event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let descriptionURL = "URL_1";

    let event = createDescriptionURLChanged(user, descriptionURL, sender, block, tx);

    onDescriptionURLChanged(event);

    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, event.params.sender, block, `[${TransactionType.POOL_EDIT}]`, BigInt.fromI32(1));

    const nextTx = getNextTx(tx);

    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");
    descriptionURL = "URL_2";

    event = createDescriptionURLChanged(user, descriptionURL, sender, block, nextTx);

    onDescriptionURLChanged(event);

    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "transaction", nextTx.hash.toHexString());

    assertTransaction(nextTx.hash, event.params.sender, block, `[${TransactionType.POOL_EDIT}]`, BigInt.fromI32(1));
  });

  test("should handle ProposalDivested event", () => {
    let proposalId = BigInt.fromI32(1);
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let baseAmount = BigInt.fromI32(100).pow(18);
    let lpAmount = BigInt.fromI32(10).pow(17);
    let lp2Amount = BigInt.fromI32(10).pow(18);

    let event = createProposalDivest(proposalId, user, lp2Amount, lpAmount, baseAmount, sender, block, tx);

    onProposalDivest(event);

    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseAmount", baseAmount.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Amount", lp2Amount.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.RISKY_PROPOSAL_DIVEST}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle ModifiedPrivateInvestors event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let privateInvestors = [
      Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f171670"),
      Address.fromString("0x86e08f7c84603AAb97cd1c89A80A9e914f181670"),
    ];

    let event = createModifiedPrivateInvestors(user, privateInvestors, true, sender, block, tx);

    onModifiedPrivateInvestors(event);

    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.POOL_UPDATE_INVESTORS}]`,
      BigInt.fromI32(1)
    );

    const nextTx = getNextTx(tx);
    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createModifiedPrivateInvestors(user, privateInvestors, true, sender, block, nextTx);

    onModifiedPrivateInvestors(event);

    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "transaction", nextTx.hash.toHexString());

    assertTransaction(
      nextTx.hash,
      event.params.sender,
      block,
      `[${TransactionType.POOL_UPDATE_INVESTORS}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle ModifiedAdmins event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let admins = [
      Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f171670"),
      Address.fromString("0x86e08f7c84603AAb97cd1c89A80A9e914f181670"),
    ];

    let event = createModifiedAdmins(user, admins, true, sender, block, tx);

    onModifiedAdmins(event);

    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.POOL_UPDATE_MANAGERS}]`,
      BigInt.fromI32(1)
    );

    const nextTx = getNextTx(tx);
    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createModifiedAdmins(user, admins, true, sender, block, nextTx);

    onModifiedAdmins(event);

    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "pool", sender.toHexString());
    assert.fieldEquals("OnlyPool", nextTx.hash.concatI32(0).toHexString(), "transaction", nextTx.hash.toHexString());

    assertTransaction(
      nextTx.hash,
      event.params.sender,
      block,
      `[${TransactionType.POOL_UPDATE_MANAGERS}]`,
      BigInt.fromI32(1)
    );
  });

  test("should handle CommissionClaimed event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let traderLpClaimed = BigInt.fromI32(10).pow(18);
    let traderBaseClaimed = BigInt.fromI32(100).pow(18);

    let event = createCommissionClaimed(user, traderLpClaimed, traderBaseClaimed, sender, block, tx);

    onCommissionClaimed(event);

    assert.fieldEquals(
      "GetPerformanceFee",
      tx.hash.concatI32(0).toHexString(),
      "baseAmount",
      traderBaseClaimed.toString()
    );
    assert.fieldEquals("GetPerformanceFee", tx.hash.concatI32(0).toHexString(), "lpAmount", traderLpClaimed.toString());
    assert.fieldEquals("GetPerformanceFee", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.TRADER_GET_PERFOMANCE_FEE}]`,
      BigInt.fromI32(1)
    );
  });
});
