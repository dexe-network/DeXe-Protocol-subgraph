import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";
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
  investor.activePools.push(basicPool.id);
  investor.allPools.push(basicPool.id);
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors.push(investor.id);
  basicPoolHistory.save();

  basicPool.investors.push(investor.id);
  basicPool.save();
}
