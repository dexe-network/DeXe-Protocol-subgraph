import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeAll, describe, newMockEvent, test } from "matchstick-as";
import { SettedERC20, SettedERC721 } from "../generated/templates/UserKeeper/UserKeeper";
import { getBlock, getTransaction } from "./utils";
import { getUserKeeperContract } from "../src/entities/UserKeeperContract";
import { onSettedERC20, onSettedERC721 } from "../src/mappings/UserKeeper";

function createSettedERC20(
  token: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): SettedERC20 {
  let event = changetype<SettedERC20>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createSettedERC721(
  token: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): SettedERC721 {
  let event = changetype<SettedERC721>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const poolAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");

describe("UserKeeper", () => {
  beforeAll(() => {
    getUserKeeperContract(contractSender, poolAddress).save();
  });

  test("should handle SettedERC20", () => {
    let tokenAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createSettedERC20(tokenAddress, contractSender, block, tx);

    onSettedERC20(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc20Token", tokenAddress.toHexString());
  });

  test("should handle SettedERC20", () => {
    let tokenAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");
    let event = createSettedERC721(tokenAddress, contractSender, block, tx);

    onSettedERC721(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc721Token", tokenAddress.toHexString());
  });
});
