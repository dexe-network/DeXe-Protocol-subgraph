import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";
import { push } from "../../helpers/ArrayHelper";
import { getBasicTraderPool } from "./BasicTraderPool";
import { getBasicPoolHistory } from "./history/BasicPoolHistory";

export function getInvestor(id: Address, pool: Address, timestamp: BigInt): Investor {
  let investor = Investor.load(id.toHexString());

  if (investor == null) {
    investor = new Investor(id.toHexString());
    investor.insurance = BigInt.zero();
    investor.claimedAmount = BigInt.zero();
    investor.activePools = new Array();
    investor.allPools = new Array();

    _onInvestorAdded(investor, pool, timestamp);
  }

  return investor;
}

export function _onInvestorAdded(investor: Investor, poolAddress: Address, timestamp: BigInt): void {
  let basicPool = getBasicTraderPool(poolAddress);
  investor.activePools = push(investor.activePools, basicPool.id);
  investor.allPools = push(investor.allPools, basicPool.id);
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors = push(basicPoolHistory.investors, investor.id);
  basicPoolHistory.save();

  basicPool.investors = push(basicPool.investors, investor.id);
  basicPool.save();
}
