import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  createMockedFunction,
  describe,
  logStore,
  newMockEvent,
  test,
} from "matchstick-as/assembly/index";
import { onChangedValidatorsBalances, onVoted } from "../src/mappings/DaoValidators";
import { Voted, ChangedValidatorsBalances } from "../generated/templates/DaoValidators/DaoValidators";

import { getBlock, getTransaction } from "./utils";
import { DaoPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { onDeployed } from "../src/mappings/PoolFactory";

function createVoted(
  proposalId: BigInt,
  sender: Address,
  vote: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Voted {
  let event = changetype<Voted>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalIds", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("vote", ethereum.Value.fromUnsignedBigInt(vote)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createChangedValidatorsBalances(
  validators: Array<Address>,
  newBalance: Array<BigInt>,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ChangedValidatorsBalances {
  let event = changetype<ChangedValidatorsBalances>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddressArray(validators)));
  event.parameters.push(new ethereum.EventParam("newBalance", ethereum.Value.fromUnsignedBigIntArray(newBalance)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createDaoPoolDeployed(
  govPool: Address,
  dp: Address,
  validators: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DaoPoolDeployed {
  let event = changetype<DaoPoolDeployed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("govPool", ethereum.Value.fromAddress(govPool)));
  event.parameters.push(new ethereum.EventParam("DP", ethereum.Value.fromAddress(dp)));
  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddress(validators)));

  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181680");
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");

describe("DaoValidators", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle Voted", () => {
    let poolCreate = createDaoPoolDeployed(
      poolAddress,
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670"),
      contractSender,
      block,
      tx
    );

    onDeployed(poolCreate);

    let proposalId = BigInt.fromI32(1);
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let vote = BigInt.fromI32(100);

    let event = createVoted(proposalId, sender, vote, contractSender, block, tx);

    onVoted(event);

    assert.fieldEquals(
      "ValidatorInProposal",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString(),
      "totalVote",
      vote.toString()
    );
    assert.fieldEquals("ProposalVote", tx.hash.concatI32(0).toHexString(), "hash", tx.hash.toHexString());
    assert.fieldEquals("ProposalVote", tx.hash.concatI32(0).toHexString(), "timestamp", block.timestamp.toString());
    assert.fieldEquals("ProposalVote", tx.hash.concatI32(0).toHexString(), "proposalId", proposalId.toString());
    assert.fieldEquals("ProposalVote", tx.hash.concatI32(0).toHexString(), "amount", vote.toString());
    assert.fieldEquals(
      "ProposalVote",
      tx.hash.concatI32(0).toHexString(),
      "voter",
      sender.concat(poolAddress).concatI32(proposalId.toI32()).toHexString()
    );
  });

  test("should handle ChangedValidatorsBalances", () => {
    let poolCreate = createDaoPoolDeployed(
      poolAddress,
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670"),
      contractSender,
      block,
      tx
    );

    onDeployed(poolCreate);

    let validators = [
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675"),
      Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181676"),
    ];
    let newBalance = [BigInt.fromI32(10).pow(18), BigInt.fromI32(10).pow(18).times(BigInt.fromI32(2))];

    let event = createChangedValidatorsBalances(validators, newBalance, contractSender, block, tx);

    onChangedValidatorsBalances(event);

    for (let i = 0; i < validators.length; i++) {
      assert.fieldEquals(
        "ValidatorInPool",
        validators[i].concat(poolAddress).toHexString(),
        "balance",
        newBalance[i].toString()
      );
      assert.fieldEquals(
        "ValidatorInPool",
        validators[i].concat(poolAddress).toHexString(),
        "pool",
        poolAddress.toHexString()
      );
    }

    validators = [validators[0]];

    event = createChangedValidatorsBalances(validators, [BigInt.zero()], contractSender, block, tx);

    onChangedValidatorsBalances(event);

    assert.fieldEquals(
      "ValidatorInPool",
      validators[0].concat(poolAddress).toHexString(),
      "balance",
      BigInt.zero().toString()
    );
    assert.fieldEquals(
      "ValidatorInPool",
      validators[0].concat(poolAddress).toHexString(),
      "pool",
      Bytes.empty().toHexString()
    );
  });
});
