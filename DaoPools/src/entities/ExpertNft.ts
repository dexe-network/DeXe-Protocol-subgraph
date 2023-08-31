import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ExpertNft } from "../../generated/schema";

export function getExpertNft(expertNftAddress: Address, tokenId: BigInt): ExpertNft {
  const id = expertNftAddress.concat(Bytes.fromByteArray(Bytes.fromBigInt(tokenId)));
  let expertNft = ExpertNft.load(id);

  if (expertNft == null) {
    expertNft = new ExpertNft(id);

    expertNft.tokenId = tokenId;
    expertNft.tags = new Array<string>();
  }

  return expertNft;
}
