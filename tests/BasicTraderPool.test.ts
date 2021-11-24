import { ethereum, log } from '@graphprotocol/graph-ts';
import { ethereum as eth, Address, BigInt, ByteArray, Bytes } from 'matchstick-as/node_modules/@graphprotocol/graph-ts';
import { clearStore, test, assert, createMockedFunction } from 'matchstick-as/assembly/index';
import { BasicTraderPool,  } from "../generated/schema";
import { getBasicPool } from "../src/entities/BasicTraderPool";
import { DeployedPoolParametersStruct } from "../generated/TraderPoolFactory/TraderPoolFactory";
import { getPoolParameters} from "../src/entities/PoolParameters";
import { castAddress, castBigInt, castBytes, castTuple, castValue } from './helpers/TypeCaster';

import { Address as addr } from "@graphprotocol/graph-ts/common/numbers"



export function runTests(): void {
    
    test("should handle Invest event from BasicPool", () => {
        let address = Address.fromString("0x76e98f7d84603AEb97cd1c89A80A9e914f181679");
        let weth = Address.fromString("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
        let owner = Address.fromString("0x4E656459ed25bF986Eea1196Bc1B00665401645d");

        const PRECISION = BigInt.fromString("10").pow(25);

        const baseParams = [ethereum.Value.fromString("placeholder.com"), ethereum.Value.fromAddress(castAddress(owner)), ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(false), ethereum.Value.fromI32(0), ethereum.Value.fromAddress(castAddress(weth)), ethereum.Value.fromI32(18), ethereum.Value.fromI32(0), ethereum.Value.fromI32(0), ethereum.Value.fromSignedBigInt(castBigInt(BigInt.fromString("50").times(PRECISION)))];

        let poolParameters = getPoolParameters(address.toHexString(), baseParams);

        let pool = getBasicPool(castAddress(address), poolParameters);

        assert.assertTrue(false);

        clearStore();
    });
}