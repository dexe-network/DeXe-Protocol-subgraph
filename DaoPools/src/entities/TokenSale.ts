import { Address } from "@graphprotocol/graph-ts";
import { DaoPool, TokenSale } from "../../generated/schema";

export function getTokenSale(
  pool: DaoPool,
  tokenSaleAddress: Address,
  tokenAddress: Address = Address.zero()
): TokenSale {
  let tokenSale = TokenSale.load(tokenSaleAddress);

  if (tokenSale == null) {
    tokenSale = new TokenSale(tokenSaleAddress);

    tokenSale.token = tokenAddress;
    tokenSale.pool = pool.id;
  }

  return tokenSale;
}
