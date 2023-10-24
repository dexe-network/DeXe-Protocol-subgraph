import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { pushUnique } from "@solarity/graph-lib";
import { Bought, TierCreated, Whitelisted } from "../../generated/templates/TokenSale/TokenSaleProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getTokenSale } from "../entities/TokenSale";
import { getTokenSaleTier } from "../entities/TokenSaleTier";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { push } from "../helpers/ArrayHelper";
import { getTokenSaleTierBuyHistory } from "../entities/TokenSaleTierBuyHistory";

export function onTierCreated(event: TierCreated): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId, event.params.saleToken);

  tier.creationHash = event.transaction.hash;

  let participationDetails = event.params.participationDetails;
  for (let i = 0; i < participationDetails.length; i++) {
    tier.whitelistTypes = push(tier.whitelistTypes, BigInt.fromI32(participationDetails[i].participationType));
    tier.data = push(tier.data, participationDetails[i].data);
  }

  tier.save();
  tokenSale.save();
}

export function onBought(event: Bought): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId);
  let pool = getDaoPool(Address.fromBytes(tokenSale.daoPool));
  let buyer = getVoterInPool(pool, getVoter(event.params.buyer), event.block.timestamp);

  tier.buyers = pushUnique<Bytes>(tier.buyers, [buyer.id]);

  if (tier.buyers.length > tier.totalBuyersCount.toI32()) {
    tier.totalBuyersCount = tier.totalBuyersCount.plus(BigInt.fromI32(tier.buyers.length).minus(tier.totalBuyersCount));
  }

  getTokenSaleTierBuyHistory(event.transaction.hash, event.block.timestamp, tier, buyer).save();

  buyer.save();
  tokenSale.save();
  tier.save();
  pool.save();
}

export function onWhitelisted(event: Whitelisted): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId);

  tier.whitelist = pushUnique(tier.whitelist, [event.params.user]);

  tier.save();
  tokenSale.save();
}
