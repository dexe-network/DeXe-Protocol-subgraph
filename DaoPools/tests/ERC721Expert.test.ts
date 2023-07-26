import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeAll, afterEach, describe, newMockEvent, test } from "matchstick-as";
import { TagsAdded, Transfer } from "../generated/templates/ERC721Expert/ERC721Expert";
import { getBlock, getTransaction } from "./utils";
import { onTagsAdded, onTransfer } from "../src/mappings/ERC721Expert";
import { ExpertNftContract } from "../generated/schema";
import { getDaoPool } from "../src/entities/DaoPool";

function createTransfer(
  from: Address,
  to: Address,
  tokenId: BigInt,
  contractSender: Bytes,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));

  event.block = block;
  event.transaction = tx;
  event.address = Address.fromBytes(contractSender);

  return event;
}

function createTagsAdded(
  tokenId: BigInt,
  tags: Array<string>,
  contractSender: Bytes,
  block: ethereum.Block,
  tx: ethereum.Transaction
): TagsAdded {
  let event = changetype<TagsAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  event.parameters.push(new ethereum.EventParam("tags", ethereum.Value.fromStringArray(tags)));

  event.block = block;
  event.transaction = tx;
  event.address = Address.fromBytes(contractSender);

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const daoPools = [
  Address.fromString("0x8081f9dDc36585D7BDe9673762BeCa477b49CdA2"),
  Address.fromString("0x5027c0495dE7f867aDf7F7084Dc4e802D6865bc0"),
];
const nfts = [
  Address.fromString("0x328f2a5cd77856aD326635485192D959ECcE1A70"),
  Address.fromString("0xD7AA6C70a88D47bF6625FFFF29d8cBDbC1A5CB9f"),
];

describe("ERC721Expert", () => {
  beforeAll(() => {
    getDaoPool(Address.fromBytes(daoPools[0])).save();
    getDaoPool(Address.fromBytes(daoPools[1])).save();

    let nft = new ExpertNftContract(nfts[0]);
    nft.daoPool = daoPools[0];
    nft.save();

    nft = new ExpertNftContract(nfts[1]);
    nft.daoPool = daoPools[1];
    nft.save();
  });

  afterEach(() => {
    // clearStore();
  });

  test("should handle Transfer (mint)", () => {
    const from = Address.zero();
    const to = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");

    let tokenId = BigInt.fromI32(1);

    let event = createTransfer(from, to, tokenId, nfts[0], block, tx);

    onTransfer(event);

    assert.fieldEquals("Expert", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals("Expert", to.toHexString(), "pools", `[${daoPools[0].toHexString()}]`);

    assert.fieldEquals(
      "ExpertInPool",
      to.concat(daoPools[0]).toHexString(),
      "id",
      to.concat(daoPools[0]).toHexString()
    );
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[0]).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[0]).toHexString(), "pool", daoPools[0].toHexString());
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[0]).toHexString(), "expert", to.toHexString());

    assert.fieldEquals(
      "ExpertNft",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals(
      "ExpertNft",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(),
      "tokenId",
      tokenId.toString()
    );
    assert.fieldEquals("ExpertNft", nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[]");
    assert.fieldEquals("ExpertNft", nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(), "expert", to.toHexString());

    event = createTransfer(from, to, tokenId, nfts[1], block, tx);

    onTransfer(event);

    assert.fieldEquals("Expert", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals(
      "Expert",
      to.toHexString(),
      "pools",
      `[${daoPools[0].toHexString()}, ${daoPools[1].toHexString()}]`
    );

    assert.fieldEquals(
      "ExpertInPool",
      to.concat(daoPools[1]).toHexString(),
      "id",
      to.concat(daoPools[1]).toHexString()
    );
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[1]).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[1]).toHexString(), "pool", daoPools[1].toHexString());
    assert.fieldEquals("ExpertInPool", to.concat(daoPools[1]).toHexString(), "expert", to.toHexString());

    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "tokenId",
      tokenId.toString()
    );
    assert.fieldEquals("ExpertNft", nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[]");
    assert.fieldEquals("ExpertNft", nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(), "expert", to.toHexString());
  });

  test("should handle Transfer (burn)", () => {
    const from = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");
    const to = Address.zero();

    let tokenId = BigInt.fromI32(1);

    let event = createTransfer(from, to, tokenId, nfts[0], block, tx);

    onTransfer(event);

    assert.fieldEquals("Expert", from.toHexString(), "id", from.toHexString());
    assert.fieldEquals("Expert", from.toHexString(), "pools", `[${daoPools[1].toHexString()}]`);

    assert.notInStore("ExpertInPool", to.concat(daoPools[0]).toHexString());
    assert.notInStore("ExpertNft", nfts[0].concat(bytesFromBigInt(tokenId)).toHexString());

    assert.fieldEquals(
      "ExpertInPool",
      from.concat(daoPools[1]).toHexString(),
      "id",
      from.concat(daoPools[1]).toHexString()
    );
    assert.fieldEquals("ExpertInPool", from.concat(daoPools[1]).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertInPool", from.concat(daoPools[1]).toHexString(), "pool", daoPools[1].toHexString());
    assert.fieldEquals("ExpertInPool", from.concat(daoPools[1]).toHexString(), "expert", from.toHexString());

    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "tokenId",
      tokenId.toString()
    );
    assert.fieldEquals("ExpertNft", nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[]");
    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "expert",
      from.toHexString()
    );

    event = createTransfer(from, to, tokenId, nfts[1], block, tx);

    onTransfer(event);

    assert.notInStore("Expert", from.toHexString());
    assert.notInStore("ExpertInPool", from.concat(daoPools[1]).toHexString());
    assert.notInStore("ExpertNft", nfts[1].concat(bytesFromBigInt(tokenId)).toHexString());
  });

  test("should handle TagsAdded", () => {
    let tokenId = BigInt.fromI32(1);
    let tags = ["tag1", "tag2"];

    let event = createTagsAdded(tokenId, tags, nfts[0], block, tx);

    onTagsAdded(event);

    assert.fieldEquals(
      "ExpertNft",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals(
      "ExpertNft",
      nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(),
      "tokenId",
      tokenId.toString()
    );
    assert.fieldEquals("ExpertNft", nfts[0].concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[tag1, tag2]");

    tags = ["tag3"];

    event = createTagsAdded(tokenId, tags, nfts[1], block, tx);

    onTagsAdded(event);

    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals(
      "ExpertNft",
      nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(),
      "tokenId",
      tokenId.toString()
    );
    assert.fieldEquals("ExpertNft", nfts[1].concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[tag3]");
  });
});

function bytesFromBigInt(v: BigInt): Bytes {
  return Bytes.fromByteArray(Bytes.fromBigInt(v));
}
