import { Deposited, Withdrawn } from "../generated/Insurance/Insurance";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assertTransaction, getBlock, getTransaction } from "./utils";
import { onDeposit, onWithdraw } from "../src/mappings/Insurance";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

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

    assert.fieldEquals("InsuranceStake", tx.hash.concatI32(0).toHexString(), "amount", expectedAmount.toString());
    assert.fieldEquals("InsuranceStake", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.investor,
      block,
      "[" + TransactionType.INSURANCE_STAKE.toString() + "]",
      BigInt.fromI32(1)
    );
  });

  test("should handle withdraw event", () => {
    let expectedAmount = BigInt.fromI32(100).pow(18);
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedSender = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createWithdrawEvent(expectedAmount, expectedInvestor, expectedSender, block, tx);

    onWithdraw(event);

    assert.fieldEquals("InsuranceStake", tx.hash.concatI32(0).toHexString(), "amount", expectedAmount.toString());
    assert.fieldEquals("InsuranceStake", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(
      tx.hash,
      event.params.investor,
      block,
      "[" + TransactionType.INSURANCE_UNSTAKE.toString() + "]",
      BigInt.fromI32(1)
    );
  });
});
