import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeAll, describe, newMockEvent, test } from "matchstick-as";
import { SetERC20, SetERC721 } from "../generated/templates/UserKeeper/UserKeeper";
import { getBlock, getTransaction } from "./utils";
import { getUserKeeperContract } from "../src/entities/UserKeeperContract";
import { onSetERC20, onSetERC721 } from "../src/mappings/UserKeeper";

export function createSetERC20(
  token: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): SetERC20 {
  let event = changetype<SetERC20>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

function createSetERC721(
  token: Address,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): SetERC721 {
  let event = changetype<SetERC721>(newMockEvent());
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

  test("should handle SetERC20", () => {
    let tokenAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181679");
    let event = createSetERC20(tokenAddress, contractSender, block, tx);

    onSetERC20(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc20Token", tokenAddress.toHexString());

    tokenAddress = Address.fromString("0xfF42F3B569cdB6dF9dC260473Ec2ef63Ca971d63");
    event = createSetERC20(tokenAddress, contractSender, block, tx);

    onSetERC20(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc20Token", tokenAddress.toHexString());
  });

  test("should handle SetERC721", () => {
    let tokenAddress = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181675");
    let event = createSetERC721(tokenAddress, contractSender, block, tx);

    onSetERC721(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc721Token", tokenAddress.toHexString());

    tokenAddress = Address.fromString("0xfF42F3B569cdB6dF9dC260473Ec2ef63Ca971d63");
    event = createSetERC721(tokenAddress, contractSender, block, tx);

    onSetERC721(event);

    assert.fieldEquals("DaoPool", poolAddress.toHexString(), "erc721Token", tokenAddress.toHexString());
  });
});
