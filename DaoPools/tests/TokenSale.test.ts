import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Bought, TierCreated, TierModified, Whitelisted } from "../generated/templates/TokenSale/TokenSaleProposal";
import { afterEach, assert, beforeAll, describe, newMockEvent, test } from "matchstick-as";
import { getBlock, getNextBlock, getNextTx, getTransaction } from "./utils";
import { getDaoPool } from "../src/entities/DaoPool";
import { getTokenSale } from "../src/entities/TokenSale";
import { onBought, onTierCreated, onTierModified, onWhitelisted } from "../src/mappings/TokenSale";

function createBought(
  tierId: BigInt,
  paidToken: Address,
  received: BigInt,
  given: BigInt,
  buyer: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Bought {
  let event = changetype<Bought>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
  event.parameters.push(new ethereum.EventParam("paidWith", ethereum.Value.fromAddress(paidToken)));
  event.parameters.push(new ethereum.EventParam("received", ethereum.Value.fromUnsignedBigInt(received)));
  event.parameters.push(new ethereum.EventParam("given", ethereum.Value.fromUnsignedBigInt(given)));
  event.parameters.push(new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createTierCreated(
  tierId: BigInt,
  saleToken: Address,
  participationTypes: BigInt[],
  data: Bytes[],
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): TierCreated {
  let event = changetype<TierCreated>(newMockEvent());
  event.parameters = new Array();

  let participationTypesArray = new Array<ethereum.Tuple>(participationTypes.length);

  for (let i = 0; i < participationTypes.length; i++) {
    let tuple = new ethereum.Tuple(2);

    tuple[0] = ethereum.Value.fromUnsignedBigInt(participationTypes[i]);
    tuple[1] = ethereum.Value.fromBytes(data[i]);

    participationTypesArray[i] = tuple;
  }

  event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
  event.parameters.push(new ethereum.EventParam("saleToken", ethereum.Value.fromAddress(saleToken)));
  event.parameters.push(
    new ethereum.EventParam("participationTypes", ethereum.Value.fromTupleArray(participationTypesArray))
  );

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createTierModified(
  tierId: BigInt,
  saleToken: Address,
  participationTypes: BigInt[],
  data: Bytes[],
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): TierModified {
  let event = changetype<TierModified>(newMockEvent());
  event.parameters = new Array();

  let participationTypesArray = new Array<ethereum.Tuple>(participationTypes.length);

  for (let i = 0; i < participationTypes.length; i++) {
    let tuple = new ethereum.Tuple(2);

    tuple[0] = ethereum.Value.fromUnsignedBigInt(participationTypes[i]);
    tuple[1] = ethereum.Value.fromBytes(data[i]);

    participationTypesArray[i] = tuple;
  }

  event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
  event.parameters.push(new ethereum.EventParam("saleToken", ethereum.Value.fromAddress(saleToken)));
  event.parameters.push(
    new ethereum.EventParam("participationTypes", ethereum.Value.fromTupleArray(participationTypesArray))
  );

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createWhitelisted(
  tierId: BigInt,
  user: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Whitelisted {
  let event = changetype<Whitelisted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

let block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
let tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");

describe("TokenSale", () => {
  beforeAll(() => {
    getDaoPool(poolAddress).save();
    getTokenSale(contractSender, poolAddress).save();
  });

  afterEach(() => {
    block = getNextBlock(block);
    tx = getNextTx(tx);
  });

  test("should handle tierCreated", () => {
    let tierId = BigInt.fromI32(5);
    let token = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181674");
    let participationTypes = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let data = [Bytes.fromI32(1), Bytes.fromI32(2)];
    let event = createTierCreated(tierId, token, participationTypes, data, contractSender, block, tx);

    onTierCreated(event);

    assert.fieldEquals("TokenSaleContract", contractSender.toHexString(), "daoPool", poolAddress.toHexString());

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "tokenSale",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "creationHash",
      tx.hash.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "saleToken",
      token.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "whitelistTypes",
      `[${participationTypes[0].toString()}, ${participationTypes[1].toString()}]`
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "data",
      `[${data[0].toHexString()}, ${data[1].toHexString()}]`
    );
  });

  test("should handle tierModifier", () => {
    let tierId = BigInt.fromI32(5);
    let token = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181674");
    let participationTypes = [BigInt.fromI32(1), BigInt.fromI32(2)];
    let data = [Bytes.fromI32(1), Bytes.fromI32(2)];
    let event = createTierCreated(tierId, token, participationTypes, data, contractSender, block, tx);

    onTierCreated(event);

    let newBlock = getNextBlock(block);
    let newTx = getNextTx(tx);
    let newParticipationTypes = [BigInt.fromI32(3), BigInt.fromI32(4)];
    let newData = [Bytes.fromI32(3), Bytes.fromI32(4)];
    let modifyEvent = createTierModified(
      tierId,
      token,
      newParticipationTypes,
      newData,
      contractSender,
      newBlock,
      newTx
    );

    onTierModified(modifyEvent);

    assert.fieldEquals("TokenSaleContract", contractSender.toHexString(), "daoPool", poolAddress.toHexString());

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "tokenSale",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "creationHash",
      tx.hash.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "saleToken",
      token.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "whitelistTypes",
      `[${newParticipationTypes[0].toString()}, ${newParticipationTypes[1].toString()}]`
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "data",
      `[${newData[0].toHexString()}, ${newData[1].toHexString()}]`
    );

    block = newBlock;
    tx = newTx;
  });

  test("should handle bought", () => {
    let tierId = BigInt.fromI32(5);
    let paidToken = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");
    let received = BigInt.fromI32(10);
    let given = BigInt.fromI32(20);
    let user1 = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181672");
    let event = createBought(tierId, paidToken, received, given, user1, contractSender, block, tx);

    onBought(event);

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "tokenSale",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "totalBuyersCount",
      "1"
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "buyers",
      `[${user1.concat(poolAddress).toHexString()}]`
    );

    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "hash",
      event.transaction.hash.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "timestamp",
      event.block.timestamp.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "paidToken",
      paidToken.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "givenAmount",
      given.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "receivedAmount",
      received.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "buyer",
      user1.concat(poolAddress).toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(0).toHexString(),
      "tier",
      contractSender.concatI32(tierId.toI32()).toHexString()
    );

    let user2 = Address.fromString("0xfF42F3B569cdB6dF9dC260473Ec2ef63Ca971d63");
    event = createBought(tierId, paidToken, received, given, user2, contractSender, block, tx);

    onBought(event);

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "tokenSale",
      contractSender.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "totalBuyersCount",
      "2"
    );
    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "buyers",
      `[${user1.concat(poolAddress).toHexString()}, ${user2.concat(poolAddress).toHexString()}]`
    );

    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "hash",
      event.transaction.hash.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "timestamp",
      event.block.timestamp.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "paidToken",
      paidToken.toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "givenAmount",
      given.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "receivedAmount",
      received.toString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "buyer",
      user2.concat(poolAddress).toHexString()
    );
    assert.fieldEquals(
      "TokenSaleTierBuyHistory",
      event.transaction.hash.concatI32(1).toHexString(),
      "tier",
      contractSender.concatI32(tierId.toI32()).toHexString()
    );
  });

  test("should add user to whitelist", () => {
    let tierId = BigInt.fromI32(5);
    let user1 = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181672");
    let user2 = Address.fromString("0x16e08f7d84603AEb97cd1c89A80A9e914f181672");
    let event1 = createWhitelisted(tierId, user1, contractSender, block, tx);
    let event2 = createWhitelisted(tierId, user2, contractSender, block, tx);

    onWhitelisted(event1);
    onWhitelisted(event2);

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "tokenSale",
      contractSender.toHexString()
    );

    assert.fieldEquals(
      "TokenSaleTier",
      contractSender.concatI32(tierId.toI32()).toHexString(),
      "whitelist",
      `[${user1.toHexString()}, ${user2.toHexString()}]`
    );
  });
});
