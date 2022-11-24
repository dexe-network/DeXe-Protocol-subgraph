import { Address } from "@graphprotocol/graph-ts";
import { UserKeeperContract } from "../../generated/schema";

export function getUserKeeperContract(
  userKeeperAddress: Address,
  poolId: Address = Address.zero()
): UserKeeperContract {
  let userKeeper = UserKeeperContract.load(userKeeperAddress);

  if (userKeeper == null) {
    userKeeper = new UserKeeperContract(userKeeperAddress);
    userKeeper.daoPool = poolId;
  }

  return userKeeper;
}
