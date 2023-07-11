import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { upcastCopy } from "@dlsl/graph-modules";
import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalSupplied,
  ProposalClaimed,
  ProposalConverted,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { InvestProposal } from "../../generated/templates/InvestProposal/InvestProposal";
import { PriceFeed } from "../../generated/templates/InvestProposal/PriceFeed";
import { DAY, PERCENTAGE_PRECISION, PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";
import { getSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getWithdraw } from "../entities/invest-pool/proposal/ProposalWithdraw";
import { deleteByIndex } from "../helpers/ArrayHelper";
import { getUSDValue } from "../helpers/PriceFeedInteractions";

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
  proposalWithdrawn(
    event.address,
    event.params.proposalId,
    event.params.amount,
    event.transaction.hash,
    event.block.timestamp
  );
}

export function onProposalSupplied(event: ProposalSupplied): void {
  proposalSupplied(
    event.address,
    event.params.proposalId,
    event.params.amounts,
    event.params.tokens,
    event.transaction.hash,
    event.block.timestamp
  );
}

export function onProposalClaimed(event: ProposalClaimed): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);

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

  proposal.save();
  proposalContract.save();
}

export function onProposalConverted(event: ProposalConverted): void {
  proposalWithdrawn(
    event.address,
    event.params.proposalId,
    event.params.amount,
    event.transaction.hash,
    event.block.timestamp
  );
  proposalSupplied(
    event.address,
    event.params.proposalId,
    [event.params.amount],
    [event.params.baseToken],
    event.transaction.hash,
    event.block.timestamp
  );
}

function totalTokenUSDCost(tokens: Array<Address>, volumes: Array<BigInt>): BigInt {
  let totalCost = BigInt.zero();

  for (let i = 0; i < tokens.length; i++) {
    totalCost = totalCost.plus(getUSDValue(tokens[i], volumes[i]));
  }

  return totalCost;
}

function getInvestedBaseInUSD(proposalAddress: Address, proposalId: BigInt, baseToken: Address): BigInt {
  let proposalPrototype = InvestProposal.bind(proposalAddress);
  let resp = proposalPrototype.try_getProposalInfos(proposalId.minus(BigInt.fromI32(1)), BigInt.fromI32(1));

  if (resp.reverted) {
    return BigInt.fromI32(1);
  }

  let usd = getUSDValue(baseToken, resp.value[0].proposalInfo.investedBase);

  if (usd.equals(BigInt.zero())) {
    return BigInt.fromI32(1);
  } else {
    return usd;
  }
}

function proposalWithdrawn(address: Address, proposalId: BigInt, amount: BigInt, hash: Bytes, timestamp: BigInt): void {
  let proposalContract = getProposalContract(address);
  let proposal = getProposal(proposalId, proposalContract);
  let withdraw = getWithdraw(hash, proposal, amount, timestamp);

  withdraw.save();
  proposal.save();
  proposalContract.save();
}

function proposalSupplied(
  address: Address,
  proposalId: BigInt,
  amounts: Array<BigInt>,
  tokens: Array<Address>,
  hash: Bytes,
  timestamp: BigInt
): void {
  let proposalContract = getProposalContract(address);
  let proposal = getProposal(proposalId, proposalContract);
  let supply = getSupply(hash, proposal, upcastCopy<Address, Bytes>(tokens), amounts, timestamp);
  let pool = getInvestTraderPool(Address.fromBytes(proposalContract.investPool));

  proposal.totalUSDSupply = proposal.totalUSDSupply.plus(totalTokenUSDCost(tokens, amounts));

  if (proposal.firstSupplyTimestamp.equals(BigInt.zero())) {
    proposal.firstSupplyTimestamp = timestamp;
  }

  let difference = timestamp.minus(proposal.firstSupplyTimestamp).div(BigInt.fromU64(DAY)).plus(BigInt.fromI32(1));
  proposal.APR = proposal.totalUSDSupply
    .times(BigInt.fromU64(PERCENTAGE_PRECISION))
    .times(BigInt.fromI32(365))
    .div(difference)
    .div(getInvestedBaseInUSD(address, proposalId, Address.fromBytes(pool.baseToken)));

  let extendTokens = proposal.leftTokens;
  let extendAmount = proposal.leftAmounts;

  for (let i = 0; i < tokens.length; i++) {
    let index = extendTokens.indexOf(tokens.at(i));

    if (index == -1) {
      extendTokens.push(tokens.at(i));
      extendAmount.push(amounts.at(i));
    } else {
      extendAmount[index] = extendAmount.at(index).plus(amounts.at(i));
    }
  }

  proposal.leftTokens = extendTokens;
  proposal.leftAmounts = extendAmount;

  supply.save();
  proposal.save();
  proposalContract.save();
}
