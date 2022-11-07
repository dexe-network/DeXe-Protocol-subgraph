import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeAll, describe, newMockEvent, test } from "matchstick-as";
import { ExecutorChanged, SettingsChanged } from "../generated/templates/DaoSettings/DaoSettings";
import { getBlock, getTransaction } from "./utils";
import { onExecutorChanged, onSettingsChanged } from "../src/mappings/DaoSettings";
import { getSettingsContract } from "../src/entities/SettingsContract";

function createSettingsChanged(
  settingsId: BigInt,
  executorDescription: string,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): SettingsChanged {
  let event = changetype<SettingsChanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("settingsId", ethereum.Value.fromUnsignedBigInt(settingsId)));
  event.parameters.push(new ethereum.EventParam("executorDescription", ethereum.Value.fromString(executorDescription)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createExecutorChanged(
  settingsId: BigInt,
  executor: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ExecutorChanged {
  let event = changetype<ExecutorChanged>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("settingsId", ethereum.Value.fromUnsignedBigInt(settingsId)));
  event.parameters.push(new ethereum.EventParam("executorDescription", ethereum.Value.fromAddress(executor)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");
const settingsId = BigInt.fromI32(2);

describe("DaoSettings", () => {
  beforeAll(() => {
    getSettingsContract(contractSender, poolAddress).save();
  });

  test("should handle SettingsChanged", () => {
    let description = "d";

    let event = createSettingsChanged(settingsId, description, contractSender, block, tx);

    onSettingsChanged(event);

    assert.fieldEquals(
      "ProposalSettings",
      poolAddress.concatI32(settingsId.toI32()).toHexString(),
      "settingsId",
      settingsId.toString()
    );
    assert.fieldEquals(
      "ProposalSettings",
      poolAddress.concatI32(settingsId.toI32()).toHexString(),
      "executorDescription",
      description
    );
  });

  test("should handle ExecutorChanged", () => {
    let executorAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181672");

    let event = createExecutorChanged(settingsId, executorAddress, contractSender, block, tx);

    onExecutorChanged(event);

    assert.fieldEquals(
      "Executor",
      poolAddress.concat(executorAddress).toHexString(),
      "executorAddress",
      executorAddress.toHexString()
    );
    assert.fieldEquals(
      "Executor",
      poolAddress.concat(executorAddress).toHexString(),
      "settings",
      poolAddress.concatI32(settingsId.toI32()).toHexString()
    );
    assert.fieldEquals(
      "Executor",
      poolAddress.concat(executorAddress).toHexString(),
      "pool",
      poolAddress.toHexString()
    );
  });
});
