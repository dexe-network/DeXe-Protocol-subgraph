import { Address } from "@graphprotocol/graph-ts";
import { ExpertNftContract } from "../../generated/schema";

export function getExpertNftContract(expertNftAddress: Address, poolId: Address = Address.zero()): ExpertNftContract {
  let expertNft = ExpertNftContract.load(expertNftAddress);

  if (expertNft == null) {
    expertNft = new ExpertNftContract(expertNftAddress);
    expertNft.daoPool = poolId;
  }

  return expertNft;
}
