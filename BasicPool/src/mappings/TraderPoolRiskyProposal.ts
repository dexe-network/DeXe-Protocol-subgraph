import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { getProposalDivestHistory } from "../entities/basic-pool/proposal/history/ProposalDivestHistory";
import { getProposalExchangeHistory } from "../entities/basic-pool/proposal/history/ProposalExchangeHistory";
import { getProposalInvestHistory } from "../entities/basic-pool/proposal/history/ProposalInvestHistory";
import { getProposal } from "../entities/basic-pool/proposal/Proposal";
import { getProposalDivest } from "../entities/basic-pool/proposal/ProposalDivest";
import { getProposalExchange } from "../entities/basic-pool/proposal/ProposalExchange";
import { getProposalInvest } from "../entities/basic-pool/proposal/ProposalInvest";
import {
  ProposalCreated,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/RiskyProposal/RiskyProposal";
import { PriceFeed } from "../../generated/templates/RiskyProposal/PriceFeed";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposal(
    event.params.index,
    event.address,
    event.params.token,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt(),
    event.params.proposalLimits[2].toBigInt()
  );
  proposal.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposal(event.params.index, event.address);
  let invest = getProposalInvest(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id,
    event.block.timestamp
  );
  let history = getProposalInvestHistory(event.block.timestamp, proposal.id);

  invest.day = history.id;

  history.totalInvestVolumeBase = history.totalInvestVolumeBase.plus(event.params.amountBase);
  history.totalInvestVolumeLP = history.totalInvestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  invest.save();
  history.save();
  investorInfo.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposal(event.params.index, event.address);
  let divest = getProposalDivest(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id,
    event.block.timestamp
  );
  let history = getProposalDivestHistory(event.block.timestamp, proposal.id);

  divest.day = history.id;

  history.totalDivestVolumeBase = history.totalDivestVolumeBase.plus(event.params.amountBase);
  history.totalDivestVolumeLP = history.totalDivestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  divest.save();
  history.save();
  investorInfo.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let proposal = getProposal(event.params.index, event.address);

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
