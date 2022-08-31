import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { WithdrawalHistory } from "../../generated/schema";
import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalSupplied,
  ProposalClaimed,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { InvestProposal } from "../../generated/templates/InvestProposal/InvestProposal";
import { PriceFeed } from "../../generated/templates/InvestProposal/PriceFeed";
import { DAY, PERCENTAGE_PRECISION, PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getClaimsHistory } from "../entities/invest-pool/proposal/history/ClaimsHistory";
import { getSuppliesHistory } from "../entities/invest-pool/proposal/history/SuppliesHistory";
import { getWithdrawHistory } from "../entities/invest-pool/proposal/history/WithdrawalHistory";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getClaim } from "../entities/invest-pool/proposal/ProposalClaim";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";
import { getSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getWithdraw } from "../entities/invest-pool/proposal/ProposalWithdraw";
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
  let withdraw = getWithdraw(event.transaction.hash, event.params.amount, event.block.timestamp);
  let history = getWithdrawHistory(proposal, event.block.timestamp);

  proposal.lastWithdraw = withdraw.id;
  withdraw.history = history.id;

  history.save();
  withdraw.save();
  proposal.save();
  proposalContract.save();
}

export function onProposalSupplied(event: ProposalSupplied): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let supply = getSupply(event.transaction.hash, upcastCopy<Address, Bytes>(event.params.tokens), event.params.amounts);
  let history = getSuppliesHistory(proposal, event.block.timestamp);
  let pool = getInvestTraderPool(Address.fromString(proposalContract.investPool.toHexString()));

  supply.history = history.id;
  proposal.lastSupply = supply.id;
  proposal.totalUSDSupply = proposal.totalUSDSupply.plus(totalTokenUSDCost(event.params.tokens, event.params.amounts));

  if (proposal.firstSupplyTimestamp.equals(BigInt.zero())) {
    proposal.firstSupplyTimestamp = event.block.timestamp;
  }

  let difference = event.block.timestamp
    .minus(proposal.firstSupplyTimestamp)
    .div(BigInt.fromU64(DAY))
    .plus(BigInt.fromI32(1));
  proposal.APR = proposal.totalUSDSupply
    .times(BigInt.fromU64(PERCENTAGE_PRECISION))
    .times(BigInt.fromI32(365))
    .div(difference)
    .div(
      getInvestedBaseInUSD(event.address, event.params.proposalId, Address.fromString(pool.baseToken.toHexString()))
    );

  let extendTokens = proposal.leftTokens;
  let extendAmount = proposal.leftAmounts;

  for (let i = 0; i < event.params.tokens.length; i++) {
    let index = extendTokens.indexOf(event.params.tokens.at(i));

    if (index == -1) {
      extendTokens.push(event.params.tokens.at(i));
      extendAmount.push(event.params.amounts.at(i));
    } else {
      extendAmount[index] = extendAmount.at(index).plus(event.params.amounts.at(i));
    }
  }

  proposal.leftTokens = extendTokens;
  proposal.leftAmounts = extendAmount;

  history.save();
  supply.save();
  proposal.save();
  proposalContract.save();
}

export function onProposalClaimed(event: ProposalClaimed): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let claim = getClaim(
    event.transaction.hash,
    upcastCopy<Address, Bytes>(event.params.tokens),
    event.params.amounts,
    event.block.timestamp
  );
  let history = getClaimsHistory(proposal, event.block.timestamp);

  claim.history = history.id;

  let tokens = proposal.leftTokens;
  let amounts = proposal.leftAmounts;

  let reduceTokens = new Array<Bytes>();

  for (let i = 0; i < event.params.tokens.length; i++) {
    let index = tokens.indexOf(event.params.tokens.at(i));

    if (index != -1) {
      amounts[index] = amounts.at(index).minus(event.params.amounts[i]);

      if (amounts.at(index) == BigInt.zero()) {
        reduceTokens.push(tokens.at(index));
      }
    }
  }

  for (let i = 0; i < reduceTokens.length; i++) {
    let index = tokens.indexOf(reduceTokens.at(i));

    tokens = deleteByIndex(tokens, index);
    amounts = deleteByIndex(amounts, index);
  }

  proposal.leftTokens = tokens;
  proposal.leftAmounts = amounts;

  claim.save();
  history.save();
  proposal.save();
  proposalContract.save();
}

function totalTokenUSDCost(tokens: Array<Address>, volumes: Array<BigInt>): BigInt {
  let totalCost = BigInt.zero();
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  for (let i = 0; i < tokens.length; i++) {
    totalCost = totalCost.plus(getUSDFromPriceFeed(pfPrototype, tokens[i], volumes[i]));
  }

  return totalCost;
}

function getInvestedBaseInUSD(proposalAddress: Address, proposalId: BigInt, baseToken: Address): BigInt {
  let proposalPrototype = InvestProposal.bind(proposalAddress);
  let resp = proposalPrototype.try_getProposalInfos(proposalId, BigInt.fromI32(1));

  if (resp.reverted) {
    return BigInt.fromI32(1);
  }

  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  let usd = getUSDFromPriceFeed(pfPrototype, baseToken, resp.value[0].proposalInfo.investedBase);

  if (usd.equals(BigInt.zero())) {
    return BigInt.fromI32(1);
  } else {
    return usd;
  }
}

function getUSDFromPriceFeed(pfPrototype: PriceFeed, baseTokenAddress: Address, fromBaseVolume: BigInt): BigInt {
  let resp = pfPrototype.try_getNormalizedPriceOutUSD(baseTokenAddress, fromBaseVolume);
  if (resp.reverted) {
    log.warning("try_getNormalizedPriceOutUSD reverted. FromToken: {}, Amount:{}", [
      baseTokenAddress.toHexString(),
      fromBaseVolume.toString(),
    ]);
    return BigInt.zero();
  } else {
    if (resp.value.value1.length == 0) {
      log.warning("try_getNormalizedPriceOutUSD returned 0 length path. FromToken: {}, Amount:{}", [
        baseTokenAddress.toHexString(),
        fromBaseVolume.toString(),
      ]);
    }
    return resp.value.value0;
  }
}
