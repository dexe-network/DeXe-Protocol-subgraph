import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";

const BASIC_POOL_NAME = "BASIC_POOL";

export function onDeployed(event: Deployed): void {
    if (event.params.poolName == BASIC_POOL_NAME) {
        let pool = getBasicTraderPool(event.params.at, event.params.basicToken);

        pool.save();
    }
}
