import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";
import { push } from "../../helpers/ArrayHelper";
import { getInvestPoolHistory } from "./history/InvestPoolHistory";
import { getInvestTraderPool } from "./InvestTraderPool";

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
  let investPool = getInvestTraderPool(poolAddress);
  investor.activePools = push(investor.activePools, investPool.id);
  investor.allPools = push(investor.allPools, investPool.id);
  investor.save();

  let investPoolHistory = getInvestPoolHistory(timestamp, investPool.id, investPool.investors);
  investPoolHistory.investors = push(investPoolHistory.investors, investor.id);
  investPoolHistory.save();

  investPool.investors = push(investPool.investors, investor.id);
  investPool.save();
}
