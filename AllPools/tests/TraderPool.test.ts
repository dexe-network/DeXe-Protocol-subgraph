import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  afterEach,
  beforeAll,
  assert,
  clearStore,
  describe,
  newMockEvent,
  test,
  createMockedFunction,
} from "matchstick-as";
import {
  CommissionClaimed,
  DescriptionURLChanged,
  InvestorAdded,
  InvestorRemoved,
  ModifiedAdmins,
  ModifiedPrivateInvestors,
  PositionClosed,
  Exchanged,
} from "../generated/templates/TraderPool/TraderPool";
import { getBlock, getNextBlock, getNextTx, getTransaction } from "./utils";
import {
  onClose,
  onDescriptionURLChanged,
  onExchange,
  onInvestorAdded,
  onInvestorRemoved,
  onModifiedAdmins,
  onModifiedPrivateInvestors,
  onTraderCommissionMinted,
} from "../src/mappings/TraderPool";
import { getTraderPool } from "../src/entities/trader-pool/TraderPool";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";

function createExchanged(
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

function createClosed(
  position: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): PositionClosed {
  let event = changetype<PositionClosed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("position", ethereum.Value.fromAddress(position)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

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
const baseToken = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181675");
const expectedUSD = BigInt.fromI32(10).pow(18);

describe("TraderPool", () => {
  beforeAll(() => {
    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e98f7d84603aeb97cd1c89a80a9e914f181675")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);
  });

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

  test("should handle Exchange event", () => {
    getTraderPool(
      sender,
      "BASIC_TRADER_POOL",
      baseToken,
      "Ticker",
      "name",
      "url",
      block.timestamp,
      block.number,
      Address.zero(),
      BigInt.fromI32(30)
    ).save();

    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let fromToken = baseToken;
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(10).pow(18);
    let toVolume = BigInt.fromI32(10).pow(19);

    let event = createExchanged(user, fromToken, toToken, fromVolume, toVolume, sender, block, tx);

    onExchange(event);

    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "fromToken", fromToken.toHexString());
    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "toToken", toToken.toHexString());
    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "fromVolume", fromVolume.toString());
    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "toVolume", toVolume.toString());
    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "usdVolume", expectedUSD.toString());
    assert.fieldEquals("Exchange", tx.hash.toHexString() + "0" + "_0", "opening", "true");

    assert.fieldEquals(
      "Position",
      sender.toHexString() + toToken.toHexString() + "0",
      "totalPositionOpenVolume",
      toVolume.toString()
    );
    assert.fieldEquals(
      "Position",
      sender.toHexString() + toToken.toHexString() + "0",
      "totalBaseOpenVolume",
      fromVolume.toString()
    );
    assert.fieldEquals("TraderPool", sender.toHexString(), "interactionCount", "1");
  });

  test("should handle PositionClosed event", () => {
    getTraderPool(
      sender,
      "BASIC_TRADER_POOL",
      baseToken,
      "tiker",
      "name",
      "url",
      block.timestamp,
      block.number,
      Address.zero(),
      BigInt.fromI32(30)
    ).save();

    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let fromToken = baseToken;
    let toToken = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181979");
    let fromVolume = BigInt.fromI32(10).pow(18);
    let toVolume = BigInt.fromI32(10).pow(19);

    let exchangeEvent = createExchanged(user, fromToken, toToken, fromVolume, toVolume, sender, block, tx);

    onExchange(exchangeEvent);

    let nextBlock = getNextBlock(block);
    let nextTx = getNextTx(tx);

    let event = createClosed(toToken, sender, nextBlock, nextTx);

    onClose(event);

    assert.fieldEquals("Position", sender.toHexString() + toToken.toHexString() + "0", "closed", "true");
    assert.fieldEquals("Position", sender.toHexString() + toToken.toHexString() + "0", "liveTime", "1");

    assert.fieldEquals("TraderPool", sender.toHexString(), "averagePositionTime", "1");
    assert.fieldEquals("TraderPool", sender.toHexString(), "totalClosedPositions", "1");
    assert.fieldEquals("TraderPool", sender.toHexString(), "maxLoss", "0");
  });
});
