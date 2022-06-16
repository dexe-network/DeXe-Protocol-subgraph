import {
  ProposalCreated,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/RiskyProposal/RiskyProposal";
import { getRiskyProposal } from "../entities/trader-pool/proposal/RiskyProposal";
import { getRiskyProposalVest } from "../entities/trader-pool/proposal/RiskyProposalVest";
import { getProposalContract } from "../entities/trader-pool/proposal/RiskyProposalContract";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getRiskyProposal(
    event.params.proposalId,
    getProposalContract(event.address),
    event.params.token,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt(),
    event.params.proposalLimits[2].toBigInt()
  );
  proposal.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getRiskyProposal(event.params.proposalId, proposalContract);

  let usdValue = getUSDValue(
    getTraderPool(Address.fromString(proposalContract.traderPool)).token,
    event.params.investedBase
  );
  let invest = getRiskyProposalVest(
    event.transaction.hash,
    proposal,
    true,
    event.params.investedBase,
    event.params.investedLP,
    usdValue,
    event.block.timestamp
  );

  proposalContract.save();
  proposal.save();
  invest.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getRiskyProposal(event.params.proposalId, proposalContract);

  let usdValue = getUSDValue(
    getTraderPool(Address.fromString(proposalContract.traderPool)).token,
    event.params.receivedBase
  );
  let divest = getRiskyProposalVest(
    event.transaction.hash,
    proposal,
    false,
    event.params.receivedBase,
    event.params.receivedLP,
    usdValue,
    event.block.timestamp
  );

  proposalContract.save();
  proposal.save();
  divest.save();
}

function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let usdValue = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromString(token.toString()), amount);

  if (!usdValue.reverted) {
    return usdValue.value.value0;
  }

  return BigInt.zero();
}
