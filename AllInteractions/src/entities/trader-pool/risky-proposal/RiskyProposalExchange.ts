import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalExchange } from "../../../../generated/schema";

export function getRiskyProposalExchange(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  fromToken: Address,
  toToken: Address,
  fromVolume: BigInt,
  toVolume: BigInt
): RiskyProposalExchange {
  let exchange = RiskyProposalExchange.load(hash);

  if (exchange == null) {
    exchange = new RiskyProposalExchange(hash);

    exchange.pool = pool;
    exchange.proposalId = proposalId;
    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
  }

  return exchange;
}
