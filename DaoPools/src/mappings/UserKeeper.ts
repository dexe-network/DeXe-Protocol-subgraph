import { Address } from "@graphprotocol/graph-ts";
import { SettedERC20, SettedERC721 } from "../../generated/templates/UserKeeper/UserKeeper";
import { getDaoPool } from "../entities/DaoPool";
import { getUserKeeperContract } from "../entities/UserKeeperContract";

export function onSettedERC20(event: SettedERC20): void {
  let daoPool = getDaoPool(Address.fromBytes(getUserKeeperContract(event.address).daoPool));
  daoPool.erc20Token = event.params.token;
  daoPool.save();
}

export function onSettedERC721(event: SettedERC721): void {
  let daoPool = getDaoPool(Address.fromBytes(getUserKeeperContract(event.address).daoPool));
  daoPool.erc721Token = event.params.token;
  daoPool.save();
}
