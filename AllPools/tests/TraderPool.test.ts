import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as";
import {
  CommissionClaimed,
  DescriptionURLChanged,
  InvestorAdded,
  InvestorRemoved,
  ModifiedAdmins,
  ModifiedPrivateInvestors,
} from "../generated/templates/TraderPool/TraderPool";
import { getBlock, getTransaction } from "./utils";
import {
  onDescriptionURLChanged,
  onInvestorAdded,
  onInvestorRemoved,
  onModifiedAdmins,
  onModifiedPrivateInvestors,
  onTraderCommissionMinted,
} from "../src/mappings/TraderPool";
import { getTraderPool } from "../src/entities/trader-pool/TraderPool";
import { getFeeHistory } from "../src/entities/trader-pool/history/FeeHistory";

function createInvestorAdded(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorAdded {
  let event = changetype<InvestorAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createInvestorRemoved(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorRemoved {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

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

  event.address = sender;
  event.block = block;
  event.transaction = tx;

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

  event.address = sender;
  event.block = block;
  event.transaction = tx;

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

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

const sender = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679");
const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

describe("TraderPool", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle InvestorAdded", () => {
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createInvestorAdded(expectedInvestor, sender, block, tx);

    onInvestorAdded(event);

    assert.fieldEquals("Investor", expectedInvestor.toHexString(), "activePools", "[" + sender.toHexString() + "]");
    assert.fieldEquals("Investor", expectedInvestor.toHexString(), "allPools", "[" + sender.toHexString() + "]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investors", "[" + expectedInvestor.toHexString() + "]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investorsCount", BigInt.fromI32(1).toString());
  });

  test("should handle InvestorRemoved", () => {
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let eventInvestorAdded = createInvestorAdded(expectedInvestor, sender, block, tx);

    onInvestorAdded(eventInvestorAdded);

    let eventInvestorRemoved = createInvestorRemoved(expectedInvestor, sender, block, tx);

    onInvestorRemoved(eventInvestorRemoved);

    assert.fieldEquals("Investor", expectedInvestor.toHexString(), "activePools", "[]");
    assert.fieldEquals("Investor", expectedInvestor.toHexString(), "allPools", "[" + sender.toHexString() + "]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investors", "[]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investorsCount", BigInt.zero().toString());
  });

  test("should handle DescriptionURLChanged", () => {
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedUrl = "URL";

    let event = createDescriptionURLChanged(expectedInvestor, expectedUrl, sender, block, tx);

    onDescriptionURLChanged(event);

    assert.fieldEquals("TraderPool", sender.toHexString(), "descriptionURL", expectedUrl);
  });

  test("should handle ModifiedAdmins", () => {
    let expectedUser = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedAdmins = [Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679")];
    let add = true;

    let event = createModifiedAdmins(expectedUser, expectedAdmins, add, sender, block, tx);

    onModifiedAdmins(event);

    assert.fieldEquals(
      "TraderPool",
      sender.toHexString(),
      "admins",
      "[" +
        getTraderPool(sender).trader.toHexString() +
        ", " +
        Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679").toHexString() +
        "]"
    );
  });

  test("should handle ModifiedPrivateInvestors", () => {
    let expectedUser = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedPrivateInvestors = [Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679")];
    let add = true;

    let event = createModifiedPrivateInvestors(expectedUser, expectedPrivateInvestors, add, sender, block, tx);

    onModifiedPrivateInvestors(event);

    assert.fieldEquals(
      "TraderPool",
      sender.toHexString(),
      "privateInvestors",
      "[" + Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679").toHexString() + "]"
    );
  });
});
