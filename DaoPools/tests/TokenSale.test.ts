// import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
// import { Bought, TierCreated, Whitelisted } from "../generated/templates/TokenSale/TokenSaleProposal";
// import { afterEach, assert, beforeAll, describe, newMockEvent, test } from "matchstick-as";
// import { getBlock, getNextBlock, getNextTx, getTransaction } from "./utils";
// import { getDaoPool } from "../src/entities/DaoPool";
// import { getTokenSale } from "../src/entities/TokenSale";
// import { onBought, onTierCreated } from "../src/mappings/TokenSale";

// function createBought(
//   tierId: BigInt,
//   buyer: Address,
//   contractSender: Address,
//   block: ethereum.Block,
//   tx: ethereum.Transaction
// ): Bought {
//   let event = changetype<Bought>(newMockEvent());
//   event.parameters = new Array();

//   event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
//   event.parameters.push(new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer)));

//   event.block = block;
//   event.transaction = tx;
//   event.address = contractSender;

//   return event;
// }

// function createTierCreated(
//   tierId: BigInt,
//   saleToken: Address,
//   contractSender: Address,
//   block: ethereum.Block,
//   tx: ethereum.Transaction
// ): TierCreated {
//   let event = changetype<TierCreated>(newMockEvent());
//   event.parameters = new Array();

//   event.parameters.push(new ethereum.EventParam("tierId", ethereum.Value.fromUnsignedBigInt(tierId)));
//   event.parameters.push(new ethereum.EventParam("saleToken", ethereum.Value.fromAddress(saleToken)));

//   event.block = block;
//   event.transaction = tx;
//   event.address = contractSender;

//   return event;
// }

// let block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
// let tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
// const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
// const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");

// describe("TokenSale", () => {
//   beforeAll(() => {
//     getDaoPool(poolAddress).save();
//     getTokenSale(contractSender, poolAddress).save();
//   });

//   afterEach(() => {
//     block = getNextBlock(block);
//     tx = getNextTx(tx);
//   });

//   test("should handle tierCreated", () => {
//     let tierId = BigInt.fromI32(5);
//     let token = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181674");
//     let event = createTierCreated(tierId, token, contractSender, block, tx);

//     onTierCreated(event);

//     assert.fieldEquals("TokenSale", contractSender.toHexString(), "token", poolAddress.toHexString());
//     assert.fieldEquals("TokenSale", contractSender.toHexString(), "pool", poolAddress.toHexString());

//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tokenSale",
//       contractSender.toHexString()
//     );
//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tierToken",
//       token.toHexString()
//     );

//     tierId = BigInt.fromI32(6);
//     token = Address.fromString("0xfF42F3B569cdB6dF9dC260473Ec2ef63Ca971d63");
//     event = createTierCreated(tierId, token, contractSender, block, tx);

//     onTierCreated(event);

//     assert.fieldEquals("TokenSale", contractSender.toHexString(), "token", poolAddress.toHexString());
//     assert.fieldEquals("TokenSale", contractSender.toHexString(), "pool", poolAddress.toHexString());

//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tokenSale",
//       contractSender.toHexString()
//     );
//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tierToken",
//       token.toHexString()
//     );
//   });

//   test("should handle bought", () => {
//     let tierId = BigInt.fromI32(5);
//     let user1 = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181672");
//     let event = createBought(tierId, user1, contractSender, block, tx);

//     onBought(event);

//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tokenSale",
//       contractSender.toHexString()
//     );
//     assert.fieldEquals("TokenSaleTier", contractSender.concatI32(tierId.toI32()).toHexString(), "totalUserCount", "1");
//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "voters",
//       `[${user1.concat(poolAddress).toHexString()}]`
//     );

//     let user2 = Address.fromString("0xfF42F3B569cdB6dF9dC260473Ec2ef63Ca971d63");
//     event = createBought(tierId, user2, contractSender, block, tx);

//     onBought(event);

//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "tokenSale",
//       contractSender.toHexString()
//     );
//     assert.fieldEquals("TokenSaleTier", contractSender.concatI32(tierId.toI32()).toHexString(), "totalUserCount", "2");
//     assert.fieldEquals(
//       "TokenSaleTier",
//       contractSender.concatI32(tierId.toI32()).toHexString(),
//       "voters",
//       `[${user1.concat(poolAddress).toHexString()}, ${user2.concat(poolAddress).toHexString()}]`
//     );
//   });
// });
