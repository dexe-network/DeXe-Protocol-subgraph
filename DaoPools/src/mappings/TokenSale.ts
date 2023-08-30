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
  let pool = getDaoPool(Address.fromBytes(tokenSale.daoPool));

  tier.buyers = pushUnique<Bytes>(tier.buyers, [
    getVoterInPool(pool, getVoter(event.params.buyer), event.block.timestamp).id,
  ]);

  if (tier.buyers.length > tier.totalBuyersCount.toI32()) {
    tier.totalBuyersCount = tier.totalBuyersCount.plus(BigInt.fromI32(tier.buyers.length).minus(tier.totalBuyersCount));
  }

  tokenSale.save();
  tier.save();
  pool.save();
}
