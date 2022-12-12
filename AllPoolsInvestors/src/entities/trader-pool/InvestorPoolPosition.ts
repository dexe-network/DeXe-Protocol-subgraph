import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor, InvestorPoolPosition, InvestorPoolPositionOffset, TraderPool } from "../../../generated/schema";

export function getInvestorPoolPosition(
  investor: Investor,
  traderPool: TraderPool,
  positionOffset: InvestorPoolPositionOffset
): InvestorPoolPosition {
  let id = investor.id.toHexString() + traderPool.id.toHexString() + positionOffset.offset.toString();
  let investorInfo = InvestorPoolPosition.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorPoolPosition(id);
    investorInfo.investor = investor.id;
    investorInfo.pool = traderPool.id;
    investorInfo.isClosed = false;

    investorInfo.totalBaseInvestVolume = BigInt.zero();
    investorInfo.totalBaseDivestVolume = BigInt.zero();

    investorInfo.totalLPInvestVolume = BigInt.zero();
    investorInfo.totalLPDivestVolume = BigInt.zero();

    investorInfo.totalUSDInvestVolume = BigInt.zero();
    investorInfo.totalUSDDivestVolume = BigInt.zero();

    investorInfo.totalNativeInvestVolume = BigInt.zero();
    investorInfo.totalNativeDivestVolume = BigInt.zero();

    investorInfo.totalBTCInvestVolume = BigInt.zero();
    investorInfo.totalBTCDivestVolume = BigInt.zero();
  }

  return investorInfo;
}
