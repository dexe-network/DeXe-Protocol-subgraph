import { Address } from "@graphprotocol/graph-ts";
import { DPContract } from "../../generated/schema";

export function getDPContract(dpAddress: Address, poolId: Address = Address.zero()): DPContract {
  let dpContract = DPContract.load(dpAddress);

  if (dpContract == null) {
    dpContract = new DPContract(dpAddress);
    dpContract.daoPool = poolId;
  }

  return dpContract;
}
