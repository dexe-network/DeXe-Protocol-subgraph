import { TraderPoolDeployed } from "../generated/PoolFactory/PoolFactory";
import { afterEach, assert, clearStore, describe, newMockEvent, test } from "matchstick-as/assembly/index";
import { getBlock, getTransaction } from "./utils";
import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { onDeployed } from "../src/mappings/PoolFactory";
import { BASIC_POOL_NAME } from "../src/entities/global/globals";

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
    let expectedBasicToken = Address.fromString("0x86e98f7d84603AEb97ad1c89A80A9e914f181679");
    let expectedCommission = BigInt.fromI32(300);
    let expectedDescriptionURL = "URL";
    let event = createTraderPoolDeployed(
      expectedPoolType,
      expectedSymbol,
      expectedName,
      expectedAt,
      expectedProposalContract,
      expectedTrader,
      expectedBasicToken,
      expectedCommission,
      expectedDescriptionURL,
      block,
      tx
    );

    onDeployed(event);

    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "id", expectedAt.toHexString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "type", BASIC_POOL_NAME);
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "baseToken", expectedBasicToken.toHexString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "ticker", expectedSymbol);
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "name", expectedName);
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "descriptionURL", expectedDescriptionURL);
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "creationTime", block.timestamp.toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "creationBlock", block.number.toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "maxLoss", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "commission", expectedCommission.toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "trader", expectedTrader.toHexString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "admins", "[" + expectedTrader.toHexString() + "]");
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "totalTrades", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "totalClosedPositions", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "averageTrades", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "averagePositionTime", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "investors", "[]");
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "investorsCount", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "privateInvestors", "[]");
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "privateInvestorsCount", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "orderSize", BigInt.zero().toString());
    assert.fieldEquals("TraderPool", expectedAt.toHexString(), "priceHistoryCount", BigInt.zero().toString());
  });
});
