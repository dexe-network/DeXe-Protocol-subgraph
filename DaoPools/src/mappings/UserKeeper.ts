import { Address } from "@graphprotocol/graph-ts";
import { SetERC20, SetERC721 } from "../../generated/templates/UserKeeper/UserKeeper";
import { getDaoPool } from "../entities/DaoPool";
import { getUserKeeperContract } from "../entities/UserKeeperContract";

export function onSetERC20(event: SetERC20): void {
  let daoPool = getDaoPool(Address.fromBytes(getUserKeeperContract(event.address).daoPool));
  daoPool.erc20Token = event.params.token;
  daoPool.save();
}

export function onSetERC721(event: SetERC721): void {
  let daoPool = getDaoPool(Address.fromBytes(getUserKeeperContract(event.address).daoPool));
  daoPool.erc721Token = event.params.token;
  daoPool.save();
}
