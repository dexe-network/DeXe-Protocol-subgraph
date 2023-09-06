import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenSaleContract, TokenSaleTier } from "../../generated/schema";

export function getTokenSaleTier(
  tokenSale: TokenSaleContract,
  tierId: BigInt,
  saleToken: Address = Address.zero(),
  whitelistType: BigInt = BigInt.zero()
): TokenSaleTier {
  let id = tokenSale.id.concatI32(tierId.toI32());
  let tier = TokenSaleTier.load(id);

  if (tier == null) {
    tier = new TokenSaleTier(id);

    tier.saleToken = saleToken;

    tier.totalBuyersCount = BigInt.zero();
    tier.buyers = new Array();

    tier.whitelistType = whitelistType;
    tier.whitelist = new Array();

    tier.tokenSale = tokenSale.id;
  }

  return tier;
}
