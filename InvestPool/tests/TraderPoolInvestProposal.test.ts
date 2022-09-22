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
} from "matchstick-as/assembly/index";
import { getBlock, getTransaction } from "./utils";
import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalClaimed,
  ProposalCreated,
  ProposalCreatedProposalLimitsStruct,
  ProposalSupplied,
  ProposalWithdrawn,
} from "../generated/templates/InvestProposal/InvestProposal";
import { getInvestTraderPool } from "../src/entities/invest-pool/InvestTraderPool";
import { getProposalContract } from "../src/entities/invest-pool/proposal/ProposalContract";
import {
  onProposalCreated,
  onProposalClaimed,
  onProposalSupplied,
  onProposalWithdrawn,
} from "../src/mappings/TraderPoolInvestProposal";
import { DAY, PRICE_FEED_ADDRESS } from "../src/entities/global/globals";

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
  amounts: Array<BigInt>,
  tokens: Array<Address>,
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

function createProposalClaimed(
  proposalId: BigInt,
  user: Address,
  amounts: Array<BigInt>,
  tokens: Array<Address>,
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

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
const proposalId = BigInt.fromI32(1);
const pool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
const baseToken = Address.fromString("0x86e08f7d84603AEb97cd1c81A80A9e914f181670");
const expectedUSD = BigInt.fromI32(10).pow(18);

describe("TraderPoolInvestProposal", () => {
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

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a85a9e914f181670")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a85a9e914f181671")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD.times(BigInt.fromI32(10))),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);

    let mainTuple = new ethereum.Tuple();
    let uintTuple = new ethereum.Tuple();
    let proposalInfos = new ethereum.Tuple();

    uintTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)));
    uintTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)));

    proposalInfos.push(ethereum.Value.fromString("test"));
    proposalInfos.push(ethereum.Value.fromTuple(uintTuple));
    proposalInfos.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3)));
    proposalInfos.push(ethereum.Value.fromUnsignedBigInt(expectedUSD));
    proposalInfos.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5)));

    mainTuple.push(ethereum.Value.fromTuple(proposalInfos));
    mainTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(6)));

    createMockedFunction(
      Address.fromString(sender.toHexString()),
      "getProposalInfos",
      "getProposalInfos(uint256,uint256):(((string,(uint256,uint256),uint256,uint256,uint256),uint256,uint256)[])"
    )
      .withArgs([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)),
      ])
      .returns([ethereum.Value.fromTupleArray([mainTuple])]);

    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c81a80a9e914f181670")),
        ethereum.Value.fromUnsignedBigInt(expectedUSD),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(expectedUSD), ethereum.Value.fromAddressArray([sender, sender])]);
  });

  beforeEach(() => {
    let traderPool = getInvestTraderPool(pool, baseToken);
    traderPool.save();
    let proposal = getProposalContract(sender, pool);
    proposal.save();
  });

  afterEach(() => {
    clearStore();
  });

  test("should handle ProposalCreated event", () => {
    let proposalLimits = new ProposalCreatedProposalLimitsStruct(3);
    proposalLimits[0] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1));
    proposalLimits[1] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2));

    let event = createProposalCreated(proposalId, proposalLimits, sender, block, tx);

    onProposalCreated(event);

    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "investPool", pool.toHexString());
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "timestampLimit", "1");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "investLPLimit", "2");

    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "leftTokens", "[]");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "leftAmounts", "[]");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "totalUSDSupply", "0");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "firstSupplyTimestamp", "0");
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "APR", "0");
  });

  test("should handle ProposalWithdrawn event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");
    let amount = BigInt.fromI32(10).pow(18);

    let event = createProposalWithdrawn(proposalId, user, amount, sender, block, tx);

    onProposalWithdrawn(event);

    assert.fieldEquals("Withdraw", event.transaction.hash.concatI32(0).toHexString(), "amountBase", amount.toString());
    assert.fieldEquals(
      "Withdraw",
      event.transaction.hash.concatI32(0).toHexString(),
      "proposal",
      sender.toHexString() + proposalId.toString()
    );
    assert.fieldEquals(
      "Withdraw",
      event.transaction.hash.concatI32(0).toHexString(),
      "hash",
      event.transaction.hash.toHexString()
    );
  });

  test("should handle ProposalSupplied event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");
    let tokens = [
      Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181670"),
      Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181671"),
    ];
    let amounts = [BigInt.fromI32(10).pow(18), BigInt.fromI32(10).pow(19)];

    let event = createProposalSupplied(proposalId, user, amounts, tokens, sender, block, tx);

    onProposalSupplied(event);

    assert.fieldEquals(
      "Supply",
      event.transaction.hash.concatI32(0).toHexString(),
      "dividendsTokens",
      "[" + tokens[0].toHexString() + ", " + tokens[1].toHexString() + "]"
    );
    assert.fieldEquals(
      "Supply",
      event.transaction.hash.concatI32(0).toHexString(),
      "amountDividendsTokens",
      "[" + amounts[0].toString() + ", " + amounts[1].toString() + "]"
    );
    assert.fieldEquals("Supply", event.transaction.hash.concatI32(0).toHexString(), "timestamp", "1");
    assert.fieldEquals(
      "Supply",
      event.transaction.hash.concatI32(0).toHexString(),
      "proposal",
      sender.toHexString() + proposalId.toString()
    );
    assert.fieldEquals(
      "Supply",
      event.transaction.hash.concatI32(0).toHexString(),
      "hash",
      event.transaction.hash.toHexString()
    );

    assert.fieldEquals(
      "Proposal",
      sender.toHexString() + proposalId.toString(),
      "totalUSDSupply",
      expectedUSD.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals("Proposal", sender.toHexString() + proposalId.toString(), "APR", "7300000");

    assert.fieldEquals(
      "Proposal",
      sender.toHexString() + proposalId.toString(),
      "leftTokens",
      "[" + tokens[0].toHexString() + ", " + tokens[1].toHexString() + "]"
    );
    assert.fieldEquals(
      "Proposal",
      sender.toHexString() + proposalId.toString(),
      "leftAmounts",
      "[" + amounts[0].toString() + ", " + amounts[1].toString() + "]"
    );
  });

  test("should handle ProposalClaimed event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181679");
    let tokens = [
      Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181670"),
      Address.fromString("0x86e08f7d84603AEb97cd1c89A85A9e914f181671"),
    ];
    let amountsToSupply = [BigInt.fromI32(10).pow(18), BigInt.fromI32(10).pow(19)];

    let amountsToClaim = [BigInt.fromI32(10).pow(17).times(BigInt.fromI32(5)), BigInt.fromI32(10).pow(19)];

    let supplyEvent = createProposalSupplied(proposalId, user, amountsToSupply, tokens, sender, block, tx);
    let claimEvent = createProposalClaimed(proposalId, user, amountsToClaim, tokens, sender, block, tx);

    onProposalSupplied(supplyEvent);
    onProposalClaimed(claimEvent);

    assert.fieldEquals(
      "Proposal",
      sender.toHexString() + proposalId.toString(),
      "leftTokens",
      "[" + tokens[0].toHexString() + "]"
    );
    assert.fieldEquals(
      "Proposal",
      sender.toHexString() + proposalId.toString(),
      "leftAmounts",
      "[" + amountsToClaim[0].toString() + "]"
    );
  });
});
