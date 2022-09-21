import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  newMockEvent,
  test,
} from "matchstick-as";
import {
  DescriptionURLChanged,
  Divested,
  Exchanged,
  Invested,
  ModifiedAdmins,
  ProposalDivested,
  ModifiedPrivateInvestors,
  CommissionClaimed,
  InvestorAdded,
  InvestorRemoved,
} from "../generated/templates/TraderPool/TraderPool";
import { getBlock, getTransaction } from "./utils";
import {
  onDivest,
  onInvest,
  onInvestorAdded,
  onInvestorRemoved,
  onModifiedPrivateInvestors,
  onProposalDivest,
} from "../src/mappings/TraderPool";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";

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

function createInvestorAddedEvent(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorAdded {
  let event = changetype<InvestorAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createInvestorRemovedEvent(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorRemoved {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
const expectedUSD = BigInt.fromI32(100).pow(18);

describe("TraderPool", () => {
  beforeAll(() => {
    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle invested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let investedBase = BigInt.fromI32(100).pow(18);
    let receivedLP = BigInt.fromI32(10).pow(18);

    let event = createInvestedEvent(user, investedBase, receivedLP, sender, block, tx);

    onInvest(event);

    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "volumeBase", investedBase.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "volumeLP", receivedLP.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());

    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalBaseInvestVolume",
      investedBase.toString()
    );
    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalLPInvestVolume",
      receivedLP.toString()
    );
    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalUSDInvestVolume",
      expectedUSD.toString()
    );

    assert.fieldEquals("InteractionCount", tx.hash.toHexString(), "count", "1");
    assert.fieldEquals(
      "LpHistory",
      user.toHexString() + sender.toHexString() + "0" + "0",
      "currentLpAmount",
      receivedLP.toString()
    );
  });

  test("should handle divested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let receivedBase = BigInt.fromI32(100).pow(18);
    let divestedLP = BigInt.fromI32(10).pow(18);

    let event = createDivestedEvent(user, receivedBase, divestedLP, sender, block, tx);

    onDivest(event);

    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "volumeBase", receivedBase.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "volumeLP", divestedLP.toString());
    assert.fieldEquals("Vest", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());

    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalBaseDivestVolume",
      receivedBase.toString()
    );
    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalLPDivestVolume",
      divestedLP.toString()
    );
    assert.fieldEquals(
      "InvestorPoolPosition",
      user.toHexString() + sender.toHexString() + "0",
      "totalUSDDivestVolume",
      expectedUSD.toString()
    );

    assert.fieldEquals("InteractionCount", tx.hash.toHexString(), "count", "1");
    assert.fieldEquals(
      "LpHistory",
      user.toHexString() + sender.toHexString() + "0" + "0",
      "currentLpAmount",
      "-" + divestedLP.toString()
    );
  });

  test("should handle ProposalDivested event", () => {
    let proposalId = BigInt.fromI32(1);
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let baseAmount = BigInt.fromI32(100).pow(18);
    let lpAmount = BigInt.fromI32(10).pow(17);
    let lp2Amount = BigInt.fromI32(10).pow(18);

    let event = createProposalDivest(proposalId, user, lp2Amount, lpAmount, baseAmount, sender, block, tx);

    onProposalDivest(event);

    let proposalEntityId = Address.zero().toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseVolume", baseAmount.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Volume", lp2Amount.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lpVolume", lpAmount.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "usdVolume", expectedUSD.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "isInvest", "false");
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "proposal", proposalEntityId);
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());

    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalBaseCloseVolume", baseAmount.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLPCloseVolume", lpAmount.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLP2CloseVolume", lp2Amount.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalUSDCloseVolume", expectedUSD.toString());

    assert.fieldEquals("InteractionCount", tx.hash.toHexString(), "count", "1");
  });

  test("should handle ModifiedPrivateInvestors event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let privateInvestors = [
      Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f171670"),
      Address.fromString("0x86e08f7c84603AAb97cd1c89A80A9e914f181670"),
    ];

    let event = createModifiedPrivateInvestors(user, privateInvestors, true, sender, block, tx);

    onModifiedPrivateInvestors(event);

    assert.fieldEquals(
      "TraderPool",
      sender.toHexString(),
      "privateInvestors",
      "[" + privateInvestors[0].toHexString() + ", " + privateInvestors[1].toHexString() + "]"
    );
    assert.fieldEquals("TraderPool", sender.toHexString(), "privateInvestorsCount", "2");

    assert.fieldEquals(
      "TraderPoolHistory",
      sender.toHexString() + "0",
      "privateInvestors",
      "[" + privateInvestors[0].toHexString() + ", " + privateInvestors[1].toHexString() + "]"
    );
    assert.fieldEquals("TraderPoolHistory", sender.toHexString() + "0", "privateInvestorsCount", "2");
  });

  test("should handle InvestorAdded event", () => {
    let investor = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let event = createInvestorAddedEvent(investor, sender, block, tx);

    onInvestorAdded(event);

    assert.fieldEquals("TraderPool", sender.toHexString(), "investors", "[" + investor.toHexString() + "]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investorsCount", "1");
    assert.fieldEquals(
      "TraderPoolHistory",
      sender.toHexString() + "0",
      "investors",
      "[" + investor.toHexString() + "]"
    );
    assert.fieldEquals("TraderPoolHistory", sender.toHexString() + "0", "investorsCount", "1");
  });

  test("should handle InvestorRemoved event", () => {
    let investor = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let eventAdded = createInvestorAddedEvent(investor, sender, block, tx);
    let eventRemoved = createInvestorRemovedEvent(investor, sender, block, tx);

    onInvestorAdded(eventAdded);
    onInvestorRemoved(eventRemoved);

    assert.fieldEquals("TraderPool", sender.toHexString(), "investors", "[]");
    assert.fieldEquals("TraderPool", sender.toHexString(), "investorsCount", "0");
    assert.fieldEquals("TraderPoolHistory", sender.toHexString() + "0", "investors", "[]");
    assert.fieldEquals("TraderPoolHistory", sender.toHexString() + "0", "investorsCount", "0");
  });
});
