import { Address } from "@graphprotocol/graph-ts";
import { Pool } from "../../../generated/schema";

export function getTraderPool(
  address: Address,
  proposalAddress: Address = Address.zero(),
  trader: Address = Address.zero()
): Pool {
  let pool = Pool.load(address);

  if (pool == null) {
    pool = new Pool(address);

    pool.proposalContract = proposalAddress;
    pool.trader = trader;
  }

  return pool;
}
