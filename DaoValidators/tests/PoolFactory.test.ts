import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { getBlock, getTransaction } from "./utils";
import { onDeployed } from "../src/mappings/PoolFactory";

function createDaoPoolDeployed(
  name: string,
  govPool: Address,
  dp: Address,
  validators: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DaoPoolDeployed {
  let event = changetype<DaoPoolDeployed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString(name)));
  event.parameters.push(new ethereum.EventParam("govPool", ethereum.Value.fromAddress(govPool)));
  event.parameters.push(new ethereum.EventParam("dp", ethereum.Value.fromAddress(dp)));
  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddress(validators)));

  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

describe("PoolFactory", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle DaoPoolDeployed", () => {
    let name = "name";
    let govPool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
    let dp = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181670");
    let validators = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");

    let event = createDaoPoolDeployed(name, govPool, dp, validators, block, tx);

    onDeployed(event);

    assert.fieldEquals("DaoPool", govPool.toHexString(), "id", govPool.toHexString());
    assert.fieldEquals("ValidatorsContract", validators.toHexString(), "pool", govPool.toHexString());
  });
});
