import { Address, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, TokenSale } from "../../generated/schema";

export function getTokenSale(
  tokenSaleAddress: Address,
  poolId: Bytes = Bytes.empty(),
  tokenAddress: Address = Address.zero()
): TokenSale {
  let tokenSale = TokenSale.load(tokenSaleAddress);

  if (tokenSale == null) {
    tokenSale = new TokenSale(tokenSaleAddress);

    tokenSale.token = tokenAddress;
    tokenSale.pool = poolId;
  }

  return tokenSale;
}
