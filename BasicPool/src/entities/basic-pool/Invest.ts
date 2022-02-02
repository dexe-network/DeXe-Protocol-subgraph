import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Invest } from "../../../generated/schema";

export function getInvest(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  toMintLP: BigInt = BigInt.fromI32(0)
): Invest {
  let id = hash.toHexString();
  let invest = Invest.load(id);

  if (invest == null) {
    invest = new Invest(id);

    invest.investor = investorInfoId;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = volumeBase.div(toMintLP);
    invest.day = "";
  }

  return invest;
}
