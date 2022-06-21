import { getProposalExchangeHistory } from "../entities/basic-pool/proposal/history/ProposalExchangeHistory";
import { getProposal } from "../entities/basic-pool/proposal/Proposal";
import { getProposalExchange } from "../entities/basic-pool/proposal/ProposalExchange";
import { ProposalCreated, ProposalExchanged } from "../../generated/templates/RiskyProposal/RiskyProposal";
import { PriceFeed } from "../../generated/templates/RiskyProposal/PriceFeed";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getProposalContract } from "../entities/basic-pool/proposal/ProposalContract";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(
    event.params.index,
    proposalContract,
    event.params.token,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt(),
    event.params.proposalLimits[2].toBigInt()
  );
  proposal.save();
  proposalContract.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.index, proposalContract);

  let exchange = getProposalExchange(
    event.transaction.hash,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume,
    BigInt.zero(),
    event.block.timestamp
  );
  let history = getProposalExchangeHistory(event.block.timestamp, proposal.id);

  exchange.day = history.id;

  if (event.params.toToken == proposal.token) {
    // adding funds to the position
    proposal.totalPositionOpenVolume = proposal.totalPositionOpenVolume.plus(event.params.toVolume);
    proposal.totalBaseOpenVolume = proposal.totalBaseOpenVolume.plus(event.params.fromVolume);

    let usd = getUSDPrice(event.params.fromToken, event.params.fromVolume);
    exchange.usdVolume = usd;
    proposal.totalUSDOpenVolume = proposal.totalUSDOpenVolume.plus(usd);
  } else if (event.params.fromToken == proposal.token) {
    // withdrawing funds from the position
    proposal.totalPositionCloseVolume = proposal.totalPositionCloseVolume.plus(event.params.fromVolume);
    proposal.totalBaseCloseVolume = proposal.totalBaseCloseVolume.plus(event.params.toVolume);

    let usd = getUSDPrice(event.params.toToken, event.params.toVolume);
    exchange.usdVolume = usd;
    proposal.totalUSDCloseVolume = proposal.totalUSDCloseVolume.plus(usd);
  }

  proposal.save();
  exchange.save();
  history.save();
  proposalContract.save();
}

function getUSDPrice(token: Address, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let resp = pfPrototype.try_getNormalizedPriceInUSD(token, amount);
  if (resp.reverted) {
    return BigInt.zero();
  } else {
    return resp.value.value0;
  }
}
