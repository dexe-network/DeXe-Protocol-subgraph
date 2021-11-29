import { InvestsToRiskyPool, PairInvestorRiskyPool } from '../../generated/schema';
import { Invest } from '../../generated/templates/RiskyPool/RiskyPool'
import { getRiskyPool } from '../entities/RiskyTraderPool';
import { getInvestor } from '../entities/Incestor'
//import { runTests } from "../../tests/BasicTraderPool.test"
export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getRiskyPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToPool = new InvestsToRiskyPool(event.transaction.hash.toHex());
    investToPool.investoToPool = pair.id;
    investToPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToPool.save();
}

function getPair(investor: string, pool: string): PairInvestorRiskyPool {
    let id = investor+pool;
    let pair = PairInvestorRiskyPool.load(id);

    if(pair == null){
        pair = new PairInvestorRiskyPool(id);
        pair.pool = pool;
        pair.investor = investor;
    }

    return pair;
};