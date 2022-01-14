import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalExchangeInBasicPool } from "../../../../generated/schema";
import { getProposalExchangeHistoryInBasicPool } from "./history/ProposalExchangeHistoryInBasicPool";

export function getProposalExchangeInBasicPool(
  hash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero()
): ProposalExchangeInBasicPool {
  let id = hash.toHex();
  let exchange = ProposalExchangeInBasicPool.load(id);

  if (exchange == null) {
    exchange = new ProposalExchangeInBasicPool(id);

    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.day = "";
  }

  return exchange;
}
