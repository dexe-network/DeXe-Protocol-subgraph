import { DaoPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { assertTransaction, getBlock, getTransaction } from "./utils";
import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { onDaoPoolDeployed } from "../src/mappings/PoolFactory";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createDaoPoolDeployed(
  name: string,
  govPool: Address,
  dp: Address,
  validators: Address,
  settings: Address,
  govUserKeeper: Address,
  expertNft: Address,
  nftMultiplier: Address,
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
  event.parameters.push(new ethereum.EventParam("localExpertNft", ethereum.Value.fromAddress(expertNft)));
  event.parameters.push(new ethereum.EventParam("nftMultiplier", ethereum.Value.fromAddress(nftMultiplier)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

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

  test("should handle DaoPoolDeployed event", () => {
    let name = "DAO_POOL";
    let govPool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181619");
    let dp = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181629");
    let validators = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181639");
    let settings = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181649");
    let govUserKeeper = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181659");
    let expertNft = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181659");
    let nftMultiplier = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181659");
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181669");

    let event = createDaoPoolDeployed(
      name,
      govPool,
      dp,
      validators,
      settings,
      govUserKeeper,
      expertNft,
      nftMultiplier,
      sender,
      block,
      tx
    );

    onDaoPoolDeployed(event);

    assert.fieldEquals("Pool", govPool.toHexString(), "id", govPool.toHexString());
    assert.fieldEquals("Pool", validators.toHexString(), "id", validators.toHexString());
    assert.fieldEquals("DaoPoolCreate", tx.hash.concatI32(0).toHexString(), "pool", govPool.toHexString());
    assert.fieldEquals("DaoPoolCreate", tx.hash.concatI32(0).toHexString(), "name", name);

    assertTransaction(
      tx.hash,
      event.params.sender,
      block,
      `[${TransactionType.DAO_POOL_CREATED}]`,
      BigInt.fromI32(1),
      govPool
    );
  });
});
