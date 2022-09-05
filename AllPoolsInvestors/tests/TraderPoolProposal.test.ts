import { Address, BigInt, ethereum, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  createMockedFunction,
  describe,
  newMockEvent,
  test,
} from "matchstick-as";
import {
  ProposalInvested,
  ProposalDivested,
  ProposalInvestorAdded,
  ProposalClaimed,
  ProposalInvestorRemoved,
} from "../generated/templates/Proposal/Proposal";
import { getBlock, getTransaction } from "./utils";
import {
  onProposalInvest,
  onProposalClaimed,
  onProposalDivest,
  onProposalInvestorAdded,
  onProposalInvestorRemoved,
} from "../src/mappings/TraderPoolProposal";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";

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

function createProposalInvestorAdded(
  proposalId: BigInt,
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalInvestorAdded {
  let event = changetype<ProposalInvestorAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalInvestorRemoved(
  proposalId: BigInt,
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalInvestorRemoved {
  let event = changetype<ProposalInvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
const proposalId = BigInt.fromI32(1);
const expectedUSD = BigInt.fromI32(100).pow(18);

describe("TraderPoolProposal", () => {
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

  test("should handle ProposalInvested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let investedLP = BigInt.fromI32(10).pow(18);
    let investedBase = BigInt.fromI32(100).pow(18);
    let receivedLP2 = BigInt.fromI32(50).pow(17);

    let event = createProposalInvested(proposalId, user, investedLP, investedBase, receivedLP2, sender, block, tx);

    onProposalInvest(event);

    let proposalEntityId = sender.toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";

    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseVolume", investedBase.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lpVolume", investedLP.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Volume", receivedLP2.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "usdVolume", expectedUSD.toString());

    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalBaseOpenVolume", investedBase.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLPOpenVolume", investedLP.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLP2OpenVolume", receivedLP2.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalUSDOpenVolume", expectedUSD.toString());
  });

  test("should handle ProposalDivested event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let receivedLP = BigInt.fromI32(10).pow(18);
    let receivedBase = BigInt.fromI32(100).pow(18);
    let divestedLP2 = BigInt.fromI32(50).pow(17);

    let event = createProposalDivested(proposalId, user, receivedLP, receivedBase, divestedLP2, sender, block, tx);

    onProposalDivest(event);

    let proposalEntityId = sender.toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";

    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "baseVolume", receivedBase.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lpVolume", receivedLP.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "lp2Volume", divestedLP2.toString());
    assert.fieldEquals("ProposalVest", tx.hash.concatI32(0).toHexString(), "usdVolume", expectedUSD.toString());

    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalBaseCloseVolume", receivedBase.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLPCloseVolume", receivedLP.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalLP2CloseVolume", divestedLP2.toString());
    assert.fieldEquals("ProposalPosition", proposalEntityId, "totalUSDCloseVolume", expectedUSD.toString());
  });

  test("should handle ProposalClaimed event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");
    let amounts = [BigInt.fromI32(100), BigInt.fromI32(50)];
    let tokens = [
      Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181671"),
      Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181672"),
    ];
    let event = createProposalClaimed(proposalId, user, amounts, tokens, sender, block, tx);

    onProposalClaimed(event);

    let proposalEntityId = sender.toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";

    assert.fieldEquals("ProposalClaim", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());
    assert.fieldEquals("ProposalClaim", tx.hash.concatI32(0).toHexString(), "timestamp", "1");
    assert.fieldEquals("ProposalClaim", tx.hash.concatI32(0).toHexString(), "proposal", proposalEntityId);
    assert.fieldEquals(
      "ProposalClaim",
      tx.hash.concatI32(0).toHexString(),
      "dividendsTokens",
      "[" + tokens[0].toHexString() + ", " + tokens[1].toHexString() + "]"
    );
    assert.fieldEquals(
      "ProposalClaim",
      tx.hash.concatI32(0).toHexString(),
      "amountDividendsTokens",
      "[" + amounts[0].toString() + ", " + amounts[1].toString() + "]"
    );
  });

  test("should handle ProposalInvestorAdded event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let event = createProposalInvestorAdded(proposalId, user, sender, block, tx);

    onProposalInvestorAdded(event);

    let proposalEntityId = sender.toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";

    assert.fieldEquals("ProposalPosition", proposalEntityId, "isClosed", "false");
  });

  test("should handle ProposalInvestorRemoved event", () => {
    let user = Address.fromString("0x86e08f7d84603AAb97cd1c89A80A9e914f181670");

    let eventAdded = createProposalInvestorAdded(proposalId, user, sender, block, tx);
    let eventRemoved = createProposalInvestorRemoved(proposalId, user, sender, block, tx);

    onProposalInvestorAdded(eventAdded);
    onProposalInvestorRemoved(eventRemoved);

    let proposalEntityId = sender.toHexString() + user.toHexString() + proposalId.toString() + "_" + "0";

    assert.fieldEquals("ProposalPosition", proposalEntityId, "isClosed", "true");
  });
});
