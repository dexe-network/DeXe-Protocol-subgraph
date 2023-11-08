import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TokenSaleContract } from "../../generated/schema";

export function getTokenSale(tokenSaleAddress: Address, poolId: Bytes = Bytes.empty()): TokenSaleContract {
  let tokenSale = TokenSaleContract.load(tokenSaleAddress);

  if (tokenSale == null) {
    tokenSale = new TokenSaleContract(tokenSaleAddress);

    tokenSale.daoPool = poolId;
  }

  return tokenSale;
}
