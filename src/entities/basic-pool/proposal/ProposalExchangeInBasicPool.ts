import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeInBasicPool } from "../../../../generated/schema";
import { getProposalExchangeHistoryInBasicPool } from "./history/ProposalExchangeHistoryInBasicPool";

export function getProposalExchangeInBasicPool(
  id: string,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalExchangeInBasicPool {
  let exchange = ProposalExchangeInBasicPool.load(id);

  if (exchange == null) {
    exchange = new ProposalExchangeInBasicPool(id);

    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.day = getProposalExchangeHistoryInBasicPool(timestamp).id;
  }

  return exchange;
}
