import { InvestsToBasicPool, PairInvestorBasicPool } from '../../generated/schema';
import { Invest } from '../../generated/templates/BasicPool/BasicPool'
import { getBasicPool } from '../entities/BasicTraderPool';
import { getInvestor } from '../entities/Incestor'

export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getBasicPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToBasicPool = new InvestsToBasicPool(event.transaction.hash.toHex());
    investToBasicPool.investoToPool = pair.id;
    investToBasicPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToBasicPool.save();
}

function getPair(investor: string, pool: string): PairInvestorBasicPool {
    let id = investor+pool;
    let pair = PairInvestorBasicPool.load(id);

    if(pair == null){
        pair = new PairInvestorBasicPool(id);
        pair.pool = pool;
        pair.investor = investor;
    }

    return pair;
};