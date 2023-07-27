import { DaoPoolDeployed, DaoTokenSaleDeployed } from "../../generated/PoolFactory/PoolFactory";
import {
  DaoPool,
  DaoSettings,
  DistributionProposal,
  TokenSale,
  UserKeeper,
  ERC721Expert,
} from "../../generated/templates";
import { getDaoPool } from "../entities/DaoPool";
import { getDPContract } from "../entities/DPContract";
import { getExpertNftContract } from "../entities/ExpertNftContract";
import { getSettingsContract } from "../entities/SettingsContract";
import { getTokenSale } from "../entities/TokenSale";
import { getUserKeeperContract } from "../entities/UserKeeperContract";

export function onDeployed(event: DaoPoolDeployed): void {
  getDaoPool(event.params.govPool, event.params.name, event.block.timestamp, event.block.number).save();

  getDPContract(event.params.dp, event.params.govPool).save();
  getSettingsContract(event.params.settings, event.params.govPool).save();
  getUserKeeperContract(event.params.govUserKeeper, event.params.govPool).save();
  getExpertNftContract(event.params.localExpertNft, event.params.govPool).save();

  DaoPool.create(event.params.govPool);
  DistributionProposal.create(event.params.dp);
  DaoSettings.create(event.params.settings);
  UserKeeper.create(event.params.govUserKeeper);
  ERC721Expert.create(event.params.localExpertNft);
}

export function onTokenSaleDeployed(event: DaoTokenSaleDeployed): void {
  TokenSale.create(event.params.tokenSale);
  let pool = getDaoPool(event.params.govPool);
  getTokenSale(event.params.tokenSale, pool.id, event.params.token).save();
  pool.save();
}
