import { InvestsToInvestPool, PairInvestorInvestPool } from '../../generated/schema';
import { Invest } from '../../generated/templates/InvestPool/InvestPool'
import { getInvestPool } from '../entities/InvestTraderPool';
import { getInvestor } from '../entities/Incestor'
import { runTests } from "../../tests/BasicTraderPool.test"
export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getInvestPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToPool = new InvestsToInvestPool(event.transaction.hash.toHex());
    investToPool.investoToPool = pair.id;
    investToPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToPool.save();
}

function getPair(investor: string, pool: string): PairInvestorInvestPool {
    let id = investor+pool;
    let pair = PairInvestorInvestPool.load(id);

    if(pair == null){
        pair = new PairInvestorInvestPool(id);
        pair.pool = pool;
        pair.investor = investor;
    }

    return pair;
};