import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { pushUnique } from "@solarity/graph-lib";
import { Bought, TierCreated, Whitelisted } from "../../generated/templates/TokenSale/TokenSaleProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getTokenSale } from "../entities/TokenSale";
import { getTokenSaleTier } from "../entities/TokenSaleTier";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";

export function onTierCreated(event: TierCreated): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId, event.params.saleToken);

  tier.save();
  tokenSale.save();
}

export function onBought(event: Bought): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId);
  let pool = getDaoPool(Address.fromBytes(tokenSale.pool));

  tier.voters = pushUnique<Bytes>(tier.voters, [
    getVoterInPool(pool, getVoter(event.params.buyer), event.block.timestamp).id,
  ]);

  if (tier.voters.length > tier.totalUserCount.toI32()) {
    tier.totalUserCount = tier.totalUserCount.plus(BigInt.fromI32(tier.voters.length).minus(tier.totalUserCount));
  }

  tokenSale.save();
  tier.save();
  pool.save();
}

export function onWhitelisted(event: Whitelisted): void {
  let tokenSale = getTokenSale(event.address);
  let tier = getTokenSaleTier(tokenSale, event.params.tierId);

  tier.userWhitelist = pushUnique(tier.userWhitelist, [event.params.user]);

  tier.save();
  tokenSale.save();
}
