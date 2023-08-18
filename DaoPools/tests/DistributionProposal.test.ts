import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeEach, createMockedFunction, describe, newMockEvent, test } from "matchstick-as";
import { DistributionProposalClaimed } from "../generated/templates/DistributionProposal/DistributionProposal";
import { getBlock, getTransaction } from "./utils";
import { onDistributionProposalClaimed } from "../src/mappings/DistributionProposal";
import { PRICE_FEED_ADDRESS } from "../src/entities/global/globals";
import { DPContract } from "../generated/schema";

function createDistributionProposalClaimed(
  proposalId: BigInt,
  sender: Address,
  token: Address,
  amount: BigInt,
  contractSender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DistributionProposalClaimed {
  let event = changetype<DistributionProposalClaimed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));

  event.block = block;
  event.transaction = tx;
  event.address = contractSender;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const contractSender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181670");
const pool = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181672");
const proposalId = BigInt.fromI32(2);

describe("DistributionProposal", () => {
  beforeEach(() => {
    createMockedFunction(
      Address.fromString(PRICE_FEED_ADDRESS),
      "getNormalizedPriceOutUSD",
      "getNormalizedPriceOutUSD(address,uint256):(uint256,address[])"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181672")),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(100000000000000000)),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(10000000000000000000)),
        ethereum.Value.fromAddressArray([contractSender, contractSender]),
      ]);

    let dPContract = new DPContract(contractSender);
    dPContract.daoPool = pool;
    dPContract.save();
  });

  test("should handle DistributionProposalClaimed", () => {
    let sender = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");
    let token = Address.fromString("0x86e08f7d84603aeb97cd1c89a80a9e914f181672");

    let event = createDistributionProposalClaimed(
      proposalId,
      sender,
      token,
      BigInt.fromI32(10).pow(17),
      contractSender,
      block,
      tx
    );

    onDistributionProposalClaimed(event);

    assert.fieldEquals(
      "VoterInPool",
      sender.concat(pool).toHexString(),
      "claimedDPs",
      `[${pool.concatI32(proposalId.toI32()).toHexString()}]`
    );
    assert.fieldEquals(
      "VoterInPool",
      sender.concat(pool).toHexString(),
      "totalDPClaimed",
      BigInt.fromU64(10000000000000000000).toString()
    );

    assert.fieldEquals(
      "Voter",
      sender.toHexString(),
      "totalClaimedUSD",
      BigInt.fromU64(10000000000000000000).toString()
    );
  });
});
