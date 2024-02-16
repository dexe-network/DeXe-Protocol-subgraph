import { pushUnique } from "@solarity/graph-lib";
import { Transfer, TagsAdded } from "../../generated/templates/ERC721Expert/ERC721Expert";
import { getExpertNft } from "../entities/ExpertNft";
import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { getExpertNftContract } from "../entities/ExpertNftContract";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getDaoPool } from "../entities/DaoPool";
import { Voter, VoterInPool } from "../../generated/schema";

export function onTransfer(event: Transfer): void {
  const expertNftContract = getExpertNftContract(event.address);
  const pool = getDaoPool(Address.fromBytes(expertNftContract.daoPool));
  const expertNft = getExpertNft(event.address, event.params.tokenId);
  let voter: Voter;
  let voterInPool: VoterInPool;

  if (event.params.from.equals(Address.zero())) {
    voter = getVoter(event.params.to);
    voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

    voterInPool.expertNft = expertNft.id;

    expertNft.save();
  } else {
    voter = getVoter(event.params.from);
    voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

    voterInPool.expertNft = Bytes.empty();

    store.remove("ExpertNft", expertNft.id.toHexString());
  }

  expertNftContract.save();
  voterInPool.save();
  voter.save();
}

export function onTagsAdded(event: TagsAdded): void {
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  expertNft.tags = pushUnique<string>(expertNft.tags, event.params.tags);

  expertNft.save();
}
