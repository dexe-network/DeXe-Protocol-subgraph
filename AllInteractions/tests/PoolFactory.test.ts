import { DaoPoolDeployed, TraderPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { assertTransaction, getBlock, getTransaction } from "./utils";
import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { onDaoPoolDeployed, onTraderPoolDeployed } from "../src/mappings/PoolFactory";
import { BASIC_POOL_NAME } from "../src/entities/global/globals";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";
import { DaoPool } from "../generated/templates";

function createTraderPoolDeployed(
  poolType: string,
  symbol: string,
  name: string,
  at: Address,
  proposalContract: Address,
  trader: Address,
  basicToken: Address,
  commission: BigInt,
  descriptionURL: string,
  block: ethereum.Block,
  tx: ethereum.Transaction
): TraderPoolDeployed {
  let event = changetype<TraderPoolDeployed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("poolType", ethereum.Value.fromString(poolType)));
  event.parameters.push(new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol)));
  event.parameters.push(new ethereum.EventParam("name", ethereum.Value.fromString(name)));
  event.parameters.push(new ethereum.EventParam("at", ethereum.Value.fromAddress(at)));
  event.parameters.push(new ethereum.EventParam("proposalContract", ethereum.Value.fromAddress(proposalContract)));
  event.parameters.push(new ethereum.EventParam("trader", ethereum.Value.fromAddress(trader)));
  event.parameters.push(new ethereum.EventParam("basicToken", ethereum.Value.fromAddress(basicToken)));
  event.parameters.push(new ethereum.EventParam("commission", ethereum.Value.fromUnsignedBigInt(commission)));
  event.parameters.push(new ethereum.EventParam("descriptionURL", ethereum.Value.fromString(descriptionURL)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createDaoPoolDeployed(
  name: string,
  govPool: Address,
  dp: Address,
  validators: Address,
  settings: Address,
  govUserKeeper: Address,
  expertNft: Address,
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
  event.parameters.push(new ethereum.EventParam("govUserKeeper", ethereum.Value.fromAddress(govUserKeeper)));
  event.parameters.push(new ethereum.EventParam("localExpertNft", ethereum.Value.fromAddress(expertNft)));
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

  test("should handle TraderPoolDeployed event", () => {
    let expectedPoolType = BASIC_POOL_NAME;
    let expectedSymbol = "BSTP";
    let expectedName = "Basic Trader Pool";
    let expectedAt = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
    let expectedProposalContract = Address.fromString("0x86e98f7d84603AEb97cd1c88A80A9e914f181679");
    let expectedTrader = Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181699");
    let expectedBasicTrader = Address.fromString("0x86e98f7d84603AEb97ad1c89A80A9e914f181679");
    let expectedCommission = BigInt.fromI32(300);
    let expectedDescriptionURL = "URL";
    let event = createTraderPoolDeployed(
      expectedPoolType,
      expectedSymbol,
      expectedName,
      expectedAt,
      expectedProposalContract,
      expectedTrader,
      expectedBasicTrader,
      expectedCommission,
      expectedDescriptionURL,
      block,
      tx
    );

    onTraderPoolDeployed(event);

    assert.fieldEquals("PoolCreate", tx.hash.concatI32(0).toHexString(), "pool", expectedAt.toHexString());
    assert.fieldEquals("PoolCreate", tx.hash.concatI32(0).toHexString(), "symbol", expectedSymbol);
    assert.fieldEquals("PoolCreate", tx.hash.concatI32(0).toHexString(), "transaction", tx.hash.toHexString());

    assertTransaction(tx.hash, event.params.trader, block, `[${TransactionType.POOL_CREATE}]`, BigInt.fromI32(1));
  });

  test("should handle DaoPoolDeployed event", () => {
    let name = "DAO_POOL";
    let govPool = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181619");
    let dp = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181629");
    let validators = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181639");
    let settings = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181649");
    let govUserKeeper = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181659");
    let expertNft = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181659");
    let sender = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181669");

    let event = createDaoPoolDeployed(
      name,
      govPool,
      dp,
      validators,
      settings,
      govUserKeeper,
      expertNft,
      sender,
      block,
      tx
    );

    onDaoPoolDeployed(event);

    assert.fieldEquals("DaoPoolCreate", tx.hash.concatI32(0).toHexString(), "pool", govPool.toHexString());
    assert.fieldEquals("DaoPoolCreate", tx.hash.concatI32(0).toHexString(), "name", name);

    assertTransaction(tx.hash, event.params.sender, block, `[${TransactionType.DAO_POOL_CREATED}]`, BigInt.fromI32(1));
  });
});
