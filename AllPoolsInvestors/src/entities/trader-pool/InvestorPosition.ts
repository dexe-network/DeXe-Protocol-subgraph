import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor, InvestorPosition, InvestorPositionOffset, TraderPool } from "../../../generated/schema";

export function getInvestorPosition(
  investor: Investor,
  traderPool: TraderPool,
  positionOffset: InvestorPositionOffset
): InvestorPosition {
  let id = investor.id + traderPool.id + positionOffset.offset.toString();
  let investorInfo = InvestorPosition.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorPosition(id);
    investorInfo.investor = investor.id;
    investorInfo.pool = traderPool.id;
    investorInfo.totalBaseInvestVolume = BigInt.zero();
    investorInfo.totalBaseDivestVolume = BigInt.zero();

    investorInfo.totalLPInvestVolume = BigInt.zero();
    investorInfo.totalLPDivestVolume = BigInt.zero();

    investorInfo.totalUSDInvestVolume = BigInt.zero();
    investorInfo.totalUSDDivestVolume = BigInt.zero();
  }
  return investorInfo;
}
