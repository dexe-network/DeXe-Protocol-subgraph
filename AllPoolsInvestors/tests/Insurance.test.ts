import { Deposited, Withdrawn, Paidout } from "../generated/Insurance/Insurance";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getBlock, getTransaction } from "./utils";
import { onDeposit, onPayout, onWithdraw } from "../src/mappings/Insurance";

function createDepositEvent(
  amount: BigInt,
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Deposited {
  let event = changetype<Deposited>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createWithdrawEvent(
  amount: BigInt,
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Withdrawn {
  let event = changetype<Withdrawn>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}
function createPaidout(
  payout: BigInt,
  userStakePayout: BigInt,
  user: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Paidout {
  let event = changetype<Paidout>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("payout", ethereum.Value.fromUnsignedBigInt(payout)));
  event.parameters.push(new ethereum.EventParam("userStakePayout", ethereum.Value.fromUnsignedBigInt(userStakePayout)));
  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

describe("Insurance", () => {
  afterEach(() => {
    clearStore();
  });
  test("should handle deposit event", () => {
    let expectedAmount = BigInt.fromI32(100).pow(18);
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedSender = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createDepositEvent(expectedAmount, expectedInvestor, expectedSender, block, tx);

    onDeposit(event);

    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "investor",
      event.params.investor.toHexString()
    );
    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "stake",
      expectedAmount.toString()
    );
    assert.fieldEquals("InsuranceHistory", event.params.investor.toHexString() + "0", "claimedAmount", "0");
    assert.fieldEquals("InsuranceHistory", event.params.investor.toHexString() + "0", "day", "0");
  });

  test("should handle withdraw event", () => {
    let depositedAmount = BigInt.fromI32(100).pow(18);
    let withdrawedAmount = BigInt.fromI32(100).pow(18).div(BigInt.fromI32(2));
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedSender = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679");

    let depositEvent = createDepositEvent(depositedAmount, expectedInvestor, expectedSender, block, tx);
    let withdrawEvent = createWithdrawEvent(withdrawedAmount, expectedInvestor, expectedSender, block, tx);

    onDeposit(depositEvent);

    onWithdraw(withdrawEvent);

    assert.fieldEquals(
      "InsuranceHistory",
      withdrawEvent.params.investor.toHexString() + "0",
      "stake",
      depositedAmount.minus(withdrawedAmount).toString()
    );
    assert.fieldEquals(
      "InsuranceHistory",
      withdrawEvent.params.investor.toHexString() + "0",
      "investor",
      withdrawEvent.params.investor.toHexString()
    );
    assert.fieldEquals("InsuranceHistory", withdrawEvent.params.investor.toHexString() + "0", "claimedAmount", "0");
    assert.fieldEquals("InsuranceHistory", withdrawEvent.params.investor.toHexString() + "0", "day", "0");

    withdrawEvent = createWithdrawEvent(withdrawedAmount, expectedInvestor, expectedSender, block, tx);
    onWithdraw(withdrawEvent);

    assert.fieldEquals("InsuranceHistory", withdrawEvent.params.investor.toHexString() + "0", "stake", "0");
    assert.fieldEquals(
      "InsuranceHistory",
      withdrawEvent.params.investor.toHexString() + "0",
      "investor",
      withdrawEvent.params.investor.toHexString()
    );
    assert.fieldEquals("InsuranceHistory", withdrawEvent.params.investor.toHexString() + "0", "claimedAmount", "0");
    assert.fieldEquals("InsuranceHistory", withdrawEvent.params.investor.toHexString() + "0", "day", "0");
  });

  test("should handle paidout event", () => {
    let expectedAmount = BigInt.fromI32(10).pow(19);
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedSender = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679");

    let depositEvent = createDepositEvent(expectedAmount, expectedInvestor, expectedSender, block, tx);

    onDeposit(depositEvent);

    let payout = BigInt.fromI32(10).pow(18);
    let stakePayout = BigInt.fromI32(5).times(BigInt.fromI32(10).pow(18));

    let event = createPaidout(payout, stakePayout, expectedInvestor, expectedSender, block, tx);

    onPayout(event);

    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "investor",
      event.params.investor.toHexString()
    );
    assert.fieldEquals("InsuranceHistory", event.params.investor.toHexString() + "0", "stake", stakePayout.toString());
    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "claimedAmount",
      payout.toString()
    );
    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "day",
      block.timestamp.div(BigInt.fromI32(86400)).toString()
    );

    onPayout(event);

    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "investor",
      event.params.investor.toHexString()
    );
    assert.fieldEquals("InsuranceHistory", event.params.investor.toHexString() + "0", "stake", "0");
    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "claimedAmount",
      payout.times(BigInt.fromI32(2)).toString()
    );
    assert.fieldEquals(
      "InsuranceHistory",
      event.params.investor.toHexString() + "0",
      "day",
      block.timestamp.div(BigInt.fromI32(86400)).toString()
    );
  });
});
