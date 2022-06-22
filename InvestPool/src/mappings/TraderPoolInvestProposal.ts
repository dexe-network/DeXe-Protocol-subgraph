import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalSupplied,
  ProposalClaimed,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { PriceFeed } from "../../generated/templates/InvestProposal/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";
import { getLastSupply } from "../entities/invest-pool/proposal/ProposalLastSupply";
import { getLastWithdraw } from "../entities/invest-pool/proposal/ProposalLastWithdraw";
import { deleteByIndex, extendArray, upcastCopy } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(
    event.params.proposalId,
    proposalContract,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
  proposalContract.save();
}

export function onProposalWithdrawn(event: ProposalWithdrawn): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let lastWithdraw = getLastWithdraw(proposal);

  lastWithdraw.amountBase = event.params.amount;

  lastWithdraw.save();
  proposal.save();
  proposalContract.save();
}

export function onProposalSupplied(event: ProposalSupplied): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let lastSupply = getLastSupply(proposal);

  lastSupply.dividendsTokens = upcastCopy<Address, Bytes>(event.params.tokens);
  lastSupply.amountDividendsTokens = event.params.amounts;

  proposal.totalUSDSupply = proposal.totalUSDSupply.plus(totalTokenUSDCost(event.params.tokens, event.params.amounts));

  let tokens = proposal.tokens;
  let amounts = proposal.amounts;

  let extendTokens = new Array<Bytes>();
  let extendAmount = new Array<BigInt>();

  for (let i = 0; i < event.params.tokens.length; i++) {
    let index = tokens.indexOf(event.params.tokens.at(i));

    if (index == -1) {
      extendTokens.push(event.params.tokens.at(i));
      extendAmount.push(event.params.amounts.at(i));
    } else {
      amounts[i] = amounts.at(i).plus(event.params.amounts[i]);
    }
  }

  proposal.tokens = extendArray(tokens, extendTokens);
  proposal.amounts = extendArray(amounts, extendAmount);

  lastSupply.save();
  proposal.save();
  proposalContract.save();
}

export function onProposalClaimed(event: ProposalClaimed): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);

  let tokens = proposal.tokens;
  let amounts = proposal.amounts;

  let reduceTokens = new Array<Bytes>();

  for (let i = 0; i < event.params.tokens.length; i++) {
    let index = tokens.indexOf(event.params.tokens.at(i));

    if (index != -1) {
      amounts[i] = amounts.at(i).minus(event.params.amounts[i]);

      if (amounts.at(i) == BigInt.zero()) {
        reduceTokens.push(tokens.at(i));
      }
    }
  }

  for (let i = 0; i < reduceTokens.length; i++) {
    let index = tokens.indexOf(reduceTokens.at(i));

    tokens = deleteByIndex(tokens, index);
    amounts = deleteByIndex(amounts, index);
  }

  proposal.tokens = tokens;
  proposal.amounts = amounts;

  proposal.save();
  proposalContract.save();
}

function totalTokenUSDCost(tokens: Array<Address>, volumes: Array<BigInt>): BigInt {
  let totalCost = BigInt.zero();
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  for (let i = 0; i < tokens.length; i++) {
    let resp = pfPrototype.try_getNormalizedPriceOutUSD(tokens[i], volumes[i]);

    if (!resp.reverted) {
      totalCost = totalCost.plus(resp.value.value0);
    }
  }

  return totalCost;
}
