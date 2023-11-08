import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
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
  getDaoPool(
    event.params.govPool,
    event.params.name,
    event.block.timestamp,
    event.block.number,
    event.params.govPoolDeps.nftMultiplierAddress,
    event.params.govPoolDeps.userKeeperAddress
  ).save();

  getDPContract(event.params.distributionProposal, event.params.govPool).save();
  getSettingsContract(event.params.govPoolDeps.settingsAddress, event.params.govPool).save();
  getUserKeeperContract(event.params.govPoolDeps.userKeeperAddress, event.params.govPool).save();
  getExpertNftContract(event.params.govPoolDeps.expertNftAddress, event.params.govPool).save();
  getTokenSale(event.params.tokenSale, event.params.govPool).save();

  DaoPool.create(event.params.govPool);
  DistributionProposal.create(event.params.distributionProposal);
  DaoSettings.create(event.params.govPoolDeps.settingsAddress);
  UserKeeper.create(event.params.govPoolDeps.userKeeperAddress);
  ERC721Expert.create(event.params.govPoolDeps.expertNftAddress);
  TokenSale.create(event.params.tokenSale);
}
