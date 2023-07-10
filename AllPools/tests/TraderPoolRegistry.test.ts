import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  createMockedFunction,
  describe,
  logStore,
  test,
} from "matchstick-as";
import { getBlock, getNextBlock, getTransaction } from "./utils";
import { getTraderPool } from "../src/entities/trader-pool/TraderPool";
import { handleBlock } from "../src/mappings/TraderPoolRegistry";
import {
  BASIC_POOL_NAME,
  CHECK_PER_BLOCK,
  INVEST_POOL_NAME,
  POOL_REGISTRY_ADDRESS,
} from "../src/entities/global/globals";

const pools = [
  Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679"),
  Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181670"),
];
const basicTokens = [
  Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181671"),
  Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181672"),
];
let block = getBlock(BigInt.zero(), BigInt.zero());

let returnData = [
  ethereum.Value.fromAddressArray(pools),
  ethereum.Value.fromTupleArray([getPoolInfoTuple(), getPoolInfoTuple()]),
  ethereum.Value.fromTupleArray([getLeverageInfo(), getLeverageInfo()]),
];

describe("TraderPoolRegistry", () => {
  beforeEach(() => {
    for (let i = 0; i < pools.length; i++) {
      getTraderPool(
        pools[i],
        BASIC_POOL_NAME,
        basicTokens[i],
        "TICKER",
        "NAME",
        "URL",
        BigInt.fromI32(1),
        BigInt.fromI32(1),
        Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679"),
        BigInt.fromI32(30)
      ).save();
    }

    createMockedFunction(Address.fromString(POOL_REGISTRY_ADDRESS), "countPools", "countPools(string):(uint256)")
      .withArgs([ethereum.Value.fromString(BASIC_POOL_NAME)])
      .returns([ethereum.Value.fromI32(2)]);
    createMockedFunction(Address.fromString(POOL_REGISTRY_ADDRESS), "countPools", "countPools(string):(uint256)")
      .withArgs([ethereum.Value.fromString(INVEST_POOL_NAME)])
      .returns([ethereum.Value.fromI32(0)]);

    createMockedFunction(
      Address.fromString(POOL_REGISTRY_ADDRESS),
      "listTraderPoolsWithInfo",
      "listTraderPoolsWithInfo(string,uint256,uint256):(address[],(string,string,(string,address,bool,uint8,bool,uint256,address,uint256,uint8,uint256,uint256),address[],uint256[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)[],(uint256,uint256,uint256,uint256)[])"
    )
      .withArgs([
        ethereum.Value.fromString(BASIC_POOL_NAME),
        ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(40)),
      ])
      .returns(returnData);
    createMockedFunction(
      Address.fromString(POOL_REGISTRY_ADDRESS),
      "listTraderPoolsWithInfo",
      "listTraderPoolsWithInfo(string,uint256,uint256):(address[],(string,string,(string,address,bool,uint8,bool,uint256,address,uint256,uint8,uint256,uint256),address[],uint256[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)[],(uint256,uint256,uint256,uint256)[])"
    )
      .withArgs([
        ethereum.Value.fromString(INVEST_POOL_NAME),
        ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(40)),
      ])
      .returns(returnData);
  });

  afterEach(() => {
    clearStore();
  });

  describe("block handler", () => {
    test("should handle block 100", () => {
      for (let i = 1; i <= 100; i++) {
        block = getBlock(BigInt.fromI32(i), BigInt.fromI32(i * 1000));
        handleBlock(block);
      }

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "timestamp", "100000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "isLast", "true");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "aggregationType", "255");

      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "timestamp", "100000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[1].toHexString() + "100",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[1].toHexString() + "100",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[1].toHexString() + "100",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[1].toHexString() + "100",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[1].toHexString() + "100",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "isLast", "true");
      assert.fieldEquals("TraderPoolPriceHistory", pools[1].toHexString() + "100", "aggregationType", "255");
    });

    test("should handle day block range", () => {
      for (let i = 1; i <= 288; i++) {
        block = getBlock(BigInt.fromU64(i * 100), BigInt.fromU64(i * 1000));
        handleBlock(block);
      }

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "timestamp", "1000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "100",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "100", "aggregationType", "255");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "timestamp", "2000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "aggregationType", "0");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "timestamp", "7000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "700",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "700",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "700",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "700",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "700",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "700", "aggregationType", "3");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1300", "aggregationType", "7");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "2500", "aggregationType", "15");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "4900", "aggregationType", "31");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "14500", "aggregationType", "63");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "timestamp", "288000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "percPNLBase", "-9000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "absPNLBase",
        "-900000000000000000"
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "28800",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "isLast", "true");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "28800", "aggregationType", "0");
    });

    test("should handle every 200th block in range 1000", () => {
      block = getBlock(BigInt.fromU64(200), BigInt.fromU64(2 * 1000));
      handleBlock(block);
      block = getBlock(BigInt.fromU64(400), BigInt.fromU64(4 * 1000));
      handleBlock(block);
      block = getBlock(BigInt.fromU64(600), BigInt.fromU64(6 * 1000));
      handleBlock(block);
      block = getBlock(BigInt.fromU64(800), BigInt.fromU64(8 * 1000));
      handleBlock(block);
      block = getBlock(BigInt.fromU64(1000), BigInt.fromU64(10 * 1000));
      handleBlock(block);

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "timestamp", "2000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "200",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "200", "aggregationType", "0");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "timestamp", "4000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "400",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "400",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "400",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "400",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "400",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "400", "aggregationType", "1");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "timestamp", "6000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "600",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "600",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "600",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "600",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "600",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "600", "aggregationType", "0");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "timestamp", "8000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "800",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "800",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "800",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "percPNLBase", "-9000");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "absPNLBase", "-900000000000000000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "800",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "800",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "isLast", "false");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "800", "aggregationType", "0");

      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "timestamp", "10000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "usdTVL",
        BigInt.fromI32(10).pow(19).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "supply",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "baseTVL",
        BigInt.fromI32(10).pow(17).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "absPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "percPNLUSD", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "percPNLBase", "-9000");
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "absPNLBase",
        "-900000000000000000"
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "traderUSD",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals(
        "TraderPoolPriceHistory",
        pools[0].toHexString() + "1000",
        "traderBase",
        BigInt.fromI32(10).pow(18).toString()
      );
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "APY", "0");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "isLast", "true");
      assert.fieldEquals("TraderPoolPriceHistory", pools[0].toHexString() + "1000", "aggregationType", "1");
    });
  });
});

function getPoolInfoTuple(): ethereum.Tuple {
  let poolInfoTuple = new ethereum.Tuple(14);
  poolInfoTuple[0] = ethereum.Value.fromString("Ticker");
  poolInfoTuple[1] = ethereum.Value.fromString("Name");
  poolInfoTuple[2] = ethereum.Value.fromTuple(getPoolParametersTuple());
  poolInfoTuple[3] = ethereum.Value.fromAddressArray([Address.zero()]);
  poolInfoTuple[4] = ethereum.Value.fromUnsignedBigIntArray([BigInt.zero()]);
  poolInfoTuple[5] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  poolInfoTuple[6] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2));
  poolInfoTuple[7] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(19));
  poolInfoTuple[8] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(17));
  poolInfoTuple[9] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(18));
  poolInfoTuple[10] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  poolInfoTuple[11] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(18));
  poolInfoTuple[12] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(18));
  poolInfoTuple[13] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10).pow(18));

  return poolInfoTuple;
}

function getPoolParametersTuple(): ethereum.Tuple {
  let poolParametersTuple = new ethereum.Tuple(9);
  poolParametersTuple[0] = ethereum.Value.fromString("URL");
  poolParametersTuple[1] = ethereum.Value.fromAddress(Address.fromString("0x86e98f7d84603AEb97cd1c89A80A9e914f181679"));
  poolParametersTuple[2] = ethereum.Value.fromBoolean(false);
  poolParametersTuple[3] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18));
  poolParametersTuple[4] = ethereum.Value.fromBoolean(false);
  poolParametersTuple[5] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  poolParametersTuple[6] = ethereum.Value.fromAddress(basicTokens[0]);
  poolParametersTuple[7] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  poolParametersTuple[8] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  poolParametersTuple[9] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18));
  poolParametersTuple[10] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());

  return poolParametersTuple;
}

function getLeverageInfo(): ethereum.Tuple {
  let leverageInfoTuple = new ethereum.Tuple(4);
  leverageInfoTuple[0] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  leverageInfoTuple[1] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  leverageInfoTuple[2] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());
  leverageInfoTuple[3] = ethereum.Value.fromUnsignedBigInt(BigInt.zero());

  return leverageInfoTuple;
}
