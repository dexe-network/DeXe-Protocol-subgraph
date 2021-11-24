import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { PoolParameters } from "../../generated/schema";
import { DeployedPoolParametersStruct } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { runTests } from "../../tests/BasicTraderPool.test"
export function getPoolParameters(id: string, params: ethereum.Value[] | null = null): PoolParameters {
    let parameters = PoolParameters.load(id);

    if (parameters == null){
        parameters = new PoolParameters(id);
        parameters.descriptionURL = params != null ? params[0].toString() : "";
        parameters.trader = params != null ? params[1].toAddress() : Address.zero();
        parameters.activePortfolio = params != null ? params[2].toBoolean() : false;;
        parameters.privatePool = params != null ? params[3].toBoolean() : false;
        parameters.totalLPEmission = params != null ? params[4].toBigInt() : new BigInt(0);
        parameters.baseToken = params != null ? params[5].toAddress() : Address.zero();
        parameters.baseTokenDecimals = params != null ? params[6].toBigInt() : new BigInt(18);
        parameters.minimalInvestment = params != null ? params[7].toBigInt() : new BigInt(0);
        parameters.commissionPeriod = params != null ? params[8].toString() : "";
        parameters.commissionPercentage = params != null ? params[9].toBigInt() : new BigInt(0);
    }

    return parameters;
}