import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalExchange } from "../../../../generated/schema";

export function getProposalExchange(
  hash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero()
): ProposalExchange {
  let id = hash.toHexString();
  let exchange = ProposalExchange.load(id);

  if (exchange == null) {
    exchange = new ProposalExchange(id);

    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.day = "";
  }

  return exchange;
}
