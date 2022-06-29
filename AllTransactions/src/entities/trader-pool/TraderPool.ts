import { Address } from "@graphprotocol/graph-ts";
import { Pool } from "../../../generated/schema";

export function getTraderPool(
  address: Address,
  proposalAddress: Address = Address.zero(),
  trader: Address = Address.zero()
): Pool {
  let pool = Pool.load(address.toHexString());

  if (pool == null) {
    pool = new Pool(address.toHexString());

    pool.proposalContract = proposalAddress.toHexString();
    pool.trader = trader;
  }

  return pool;
}
