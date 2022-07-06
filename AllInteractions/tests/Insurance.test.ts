import { Deposited, ProposedClaim, Withdrawn } from "../generated/Insurance/Insurance";
import { assert, beforeAll, beforeEach, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getBlock, getNextBlock, getNextTx, getTransaction } from "./utils";
import { onDeposit } from "../src/mappings/Insurance";

function createDepositEvent(
  amount: BigInt,
  investor: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Deposited {
  let event = changetype<Deposited>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createWithdrawEvent(
  amount: BigInt,
  investor: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Withdrawn {
  let event = changetype<Withdrawn>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createProposedClaimEvent(sender: Address, block: ethereum.Block, tx: ethereum.Transaction): ProposedClaim {
  let event = changetype<ProposedClaim>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;

  return event;
}

describe("Insurance", () => {
  let block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
  let tx = getTransaction(<Bytes>Bytes.fromBigInt(BigInt.fromI32(1)));

  beforeEach(() => {
    block = getNextBlock(block);
    tx = getNextTx(tx);
  });

  test("should handel", () => {
    let expectedAmount = BigInt.fromI32(100).times(BigInt.fromI32(18));
    let expectedInvestor = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createDepositEvent(expectedAmount, expectedInvestor, block, tx);

    onDeposit(event);

    assert.fieldEquals("InsuranceStake", tx.hash.toHexString(), "amount", expectedAmount.toString());
    assert.fieldEquals("InsuranceStake", tx.hash.toHexString(), "transaction", tx.hash.toHexString());
  });
});
