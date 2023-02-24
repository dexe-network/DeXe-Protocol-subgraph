import { BigInt } from "@graphprotocol/graph-ts";
import { TokenSale, TokenSaleTier } from "../../generated/schema";

export function getTokenSaleTier(tokenSale: TokenSale, tierId: BigInt): TokenSaleTier {
  let id = tokenSale.id.concatI32(tierId.toI32());
  let tier = TokenSaleTier.load(id);

  if (tier == null) {
    tier = new TokenSaleTier(id);

    tier.tokenSale = tokenSale.id;
    tier.totalUserCount = BigInt.zero();
    tier.voters = new Array();
  }

  return tier;
}
