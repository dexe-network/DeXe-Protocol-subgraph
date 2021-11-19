import { PoolParameters } from "../../generated/schema";
import { DeployedPoolParametersStruct } from "../../generated/TraderPoolFactory/TraderPoolFactory";

export function getPoolParameters(id: string, params: DeployedPoolParametersStruct | null = null): PoolParameters {
    let parameters = PoolParameters.load(id);

    if (parameters == null){
        parameters = new PoolParameters(id);
        parameters.descriptionURL = params?.descriptionURL || null;
        parameters.trader = params?.trader || null;
        parameters.activePortfolio = params?.activePortfolio || false;
        parameters.privatePool = params?.privatePool || false;
        parameters.totalLPEmission = params?.totalLPEmission || null;
        parameters.baseToken = params?.baseToken || null;
        parameters.baseTokenDecimals = params?.baseTokenDecimals || null;
        parameters.minimalInvestment = params?.minimalInvestment || null;
        parameters.commissionPeriod = params?.commissionPeriod.toString() || null;
        parameters.commissionPercentage = params?.commissionPercentage || null;
    }

    return parameters;
}