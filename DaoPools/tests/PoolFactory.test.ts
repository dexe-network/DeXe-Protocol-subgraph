import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolDeployed, DaoTokenSaleDeployed } from "../generated/PoolFactory/PoolFactory";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { getBlock, getTransaction } from "./utils";
import { onDeployed, onTokenSaleDeployed } from "../src/mappings/PoolFactory";

function createDaoPoolDeployed(
  name: string,
  govPool: Address,
  dp: Address,
  validators: Address,
  settings: Address,
  govUserKeeper: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DaoPoolDeployed {
  let event = changetype<DaoPoolDeployed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString(name)));
  event.parameters.push(new ethereum.EventParam("govPool", ethereum.Value.fromAddress(govPool)));
  event.parameters.push(new ethereum.EventParam("dp", ethereum.Value.fromAddress(dp)));
  event.parameters.push(new ethereum.EventParam("validators", ethereum.Value.fromAddress(validators)));
  event.parameters.push(new ethereum.EventParam("settings", ethereum.Value.fromAddress(settings)));
  event.parameters.push(new ethereum.EventParam("govUserKeeper", ethereum.Value.fromAddress(govUserKeeper)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createDaoTokenSaleDeployed(govPool: Address, tokenSale: Address, token: Address): DaoTokenSaleDeployed {
  let event = changetype<DaoTokenSaleDeployed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("govPool", ethereum.Value.fromAddress(govPool)));
  event.parameters.push(new ethereum.EventParam("tokenSale", ethereum.Value.fromAddress(tokenSale)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));

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
    let settings = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");
    let govUserKeeper = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181673");
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181674");

    let event = createDaoPoolDeployed(name, govPool, dp, validators, settings, govUserKeeper, sender, block, tx);

    onDeployed(event);

    assert.fieldEquals("DaoPool", govPool.toHexString(), "name", name);
    assert.fieldEquals("DaoPool", govPool.toHexString(), "votersCount", BigInt.zero().toString());
    assert.fieldEquals("DaoPool", govPool.toHexString(), "creationTime", block.timestamp.toString());
    assert.fieldEquals("DaoPool", govPool.toHexString(), "creationBlock", block.number.toString());

    assert.fieldEquals("DPContract", dp.toHexString(), "daoPool", govPool.toHexString());
    assert.fieldEquals("SettingsContract", settings.toHexString(), "daoPool", govPool.toHexString());
    assert.fieldEquals("UserKeeperContract", govUserKeeper.toHexString(), "daoPool", govPool.toHexString());
  });

  test("should handle DaoTokenSaleDeployed", () => {
    let govPool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
    let tokenSaleAddress = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181671");
    let tokenAddress = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181672");

    let event = createDaoTokenSaleDeployed(govPool, tokenSaleAddress, tokenAddress);

    onTokenSaleDeployed(event);

    assert.fieldEquals("TokenSale", tokenSaleAddress.toHexString(), "token", tokenAddress.toHexString());
    assert.fieldEquals("TokenSale", tokenSaleAddress.toHexString(), "pool", govPool.toHexString());
  });
});
