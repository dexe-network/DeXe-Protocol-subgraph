import { pushUnique, remove } from "@solarity/graph-lib";
import { Transfer, TagsAdded } from "../../generated/templates/ERC721Expert/ERC721Expert";
import { getExpertNft } from "../entities/ExpertNft";
import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { getExpertNftContract } from "../entities/ExpertNftContract";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getDaoPool } from "../entities/DaoPool";

export function onTransfer(event: Transfer): void {
  const expertNftContract = getExpertNftContract(event.address);
  const pool = getDaoPool(Address.fromBytes(expertNftContract.daoPool));
  const voter = getVoter(event.params.to);
  const voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  if (event.params.from.equals(Address.zero())) {
    voterInPool.expertNft = expertNft.id;

    expertNft.save();
  } else {
    voterInPool.expertNft = Bytes.empty();

    store.remove("ExpertNft", expertNft.id.toHexString());
  }

  voter.save();
  voterInPool.save();
  expertNftContract.save();
}

export function onTagsAdded(event: TagsAdded): void {
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  expertNft.tags = pushUnique<string>(expertNft.tags, event.params.tags);

  expertNft.save();
}
