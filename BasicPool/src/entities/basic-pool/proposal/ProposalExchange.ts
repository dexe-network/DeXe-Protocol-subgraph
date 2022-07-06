import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalExchange } from "../../../../generated/schema";

export function getProposalExchange(
  hash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  usdVolume: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalExchange {
  let exchange = ProposalExchange.load(hash);

  if (exchange == null) {
    exchange = new ProposalExchange(hash);

    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.usdVolume = usdVolume;
    exchange.day = "";
    exchange.timestamp = timestamp;
  }

  return exchange;
}
