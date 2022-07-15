import { getProposalExchangeHistory } from "../entities/basic-pool/proposal/history/ProposalExchangeHistory";
import { getProposal } from "../entities/basic-pool/proposal/Proposal";
import { getProposalExchange } from "../entities/basic-pool/proposal/ProposalExchange";
import {
  ProposalActivePortfolioExchanged,
  ProposalCreated,
  ProposalExchanged,
  ProposalPositionClosed,
} from "../../generated/templates/RiskyProposal/RiskyProposal";
import { PriceFeed } from "../../generated/templates/RiskyProposal/PriceFeed";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getProposalContract } from "../entities/basic-pool/proposal/ProposalContract";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getProposalPosition } from "../entities/basic-pool/proposal/ProposalPosition";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(
    event.params.proposalId,
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
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let positionOffset = getPositionOffset(proposal);
  let position = getProposalPosition(proposal, positionOffset);

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
    position.totalPositionOpenVolume = position.totalPositionOpenVolume.plus(event.params.toVolume);
    position.totalBaseOpenVolume = position.totalBaseOpenVolume.plus(event.params.fromVolume);

    let usd = getUSDPrice(event.params.fromToken, event.params.fromVolume);
    exchange.usdVolume = usd;
    position.totalUSDOpenVolume = position.totalUSDOpenVolume.plus(usd);
  } else if (event.params.fromToken == proposal.token) {
    // withdrawing funds from the position
    position.totalPositionCloseVolume = position.totalPositionCloseVolume.plus(event.params.fromVolume);
    position.totalBaseCloseVolume = position.totalBaseCloseVolume.plus(event.params.toVolume);

    let usd = getUSDPrice(event.params.toToken, event.params.toVolume);
    exchange.usdVolume = usd;
    position.totalUSDCloseVolume = position.totalUSDCloseVolume.plus(usd);
  }

  proposal.save();
  exchange.save();
  history.save();
  proposalContract.save();
  positionOffset.save();
  position.save();
}

export function onProposalPositionClosed(event: ProposalPositionClosed): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let positionOffset = getPositionOffset(proposal);
  let position = getProposalPosition(proposal, positionOffset);

  position.isClosed = true;

  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  proposalContract.save();
  proposal.save();
  positionOffset.save();
  position.save();
}

export function onProposalActivePortfolioExchanged(event: ProposalActivePortfolioExchanged): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let positionOffset = getPositionOffset(proposal);
  let position = getProposalPosition(proposal, positionOffset);

  if (event.params.toToken == proposal.token) {
    // adding funds to the position
    position.totalPositionOpenVolume = position.totalPositionOpenVolume.plus(event.params.toVolume);
    position.totalBaseOpenVolume = position.totalBaseOpenVolume.plus(event.params.fromVolume);

    let usd = getUSDPrice(event.params.fromToken, event.params.fromVolume);
    position.totalUSDOpenVolume = position.totalUSDOpenVolume.plus(usd);
  } else if (event.params.fromToken == proposal.token) {
    // withdrawing funds from the position
    position.totalPositionCloseVolume = position.totalPositionCloseVolume.plus(event.params.fromVolume);
    position.totalBaseCloseVolume = position.totalBaseCloseVolume.plus(event.params.toVolume);

    let usd = getUSDPrice(event.params.toToken, event.params.toVolume);
    position.totalUSDCloseVolume = position.totalUSDCloseVolume.plus(usd);
  }

  positionOffset.save();
  position.save();
}

function getUSDPrice(token: Address, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let resp = pfPrototype.try_getNormalizedPriceOutUSD(token, amount);
  if (resp.reverted) {
    return BigInt.zero();
  } else {
    return resp.value.value0;
  }
}
