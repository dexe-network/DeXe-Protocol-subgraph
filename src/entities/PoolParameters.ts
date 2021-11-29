import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { PoolParameters } from "../../generated/schema";
import { DeployedPoolParametersStruct } from "../../generated/TraderPoolFactory/TraderPoolFactory";
//import { runTests } from "../../tests/BasicTraderPool.test"

const periods = ["PERIOD_1", "PERIOD_2", "PERIOD_3"];

export function getPoolParameters(id: string, params: DeployedPoolParametersStruct | null = null): PoolParameters {
    let parameters = PoolParameters.load(id);

    if (parameters == null){
        parameters = new PoolParameters(id);
        parameters.descriptionURL = params != null ? params.descriptionURL : "";
        parameters.trader = params != null ? params.trader : Address.zero();
        parameters.activePortfolio = params != null ? params.activePortfolio : false;;
        parameters.privatePool = params != null ? params.privatePool : false;
        parameters.totalLPEmission = params != null ? params.totalLPEmission : new BigInt(0);
        parameters.baseToken = params != null ? params.baseToken : Address.zero();
        parameters.baseTokenDecimals = params != null ? params.baseTokenDecimals : new BigInt(18);
        parameters.minimalInvestment = params != null ? params.minimalInvestment : new BigInt(0);
        parameters.commissionPeriod = params != null ? periods[params.commissionPeriod] : "";
        parameters.commissionPercentage = params != null ? params.commissionPercentage : new BigInt(0);
    }

    return parameters;
}