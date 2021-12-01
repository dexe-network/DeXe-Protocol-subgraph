import { InvestsToRiskyPool, PairInvestorRiskyPool } from '../../generated/schema';
import { Invest } from '../../generated/templates/RiskyPool/RiskyPool'
import { getRiskyPool } from '../entities/RiskyTraderPool';
import { getInvestor } from '../entities/Investor'
import { PositionOpen } from '../../generated/templates/BasicPool/BasicPool';
import { getPositionForRiskyPool } from '../entities/Position';
import { getExchangeToRiskyPool } from '../entities/ExchangeToRiskyPool';
//import { runTests } from "../../tests/BasicTraderPool.test"

export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getRiskyPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToPool = new InvestsToRiskyPool(event.transaction.hash.toHex());
    investToPool.investorToPool = pair.id;
    investToPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToPool.save();
}

export function onOpen(event: PositionOpen): void {
    let investor = getInvestor(event.params.sender);
    let pool = getRiskyPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    let position = getPositionForRiskyPool(event.transaction.hash.toHex(), pool.id, event.params.to, event.params.from);
    
    let exchange = getExchangeToRiskyPool(event.transaction.hash.toHex(), investor, pair, event.params.amount, position);

    investor.save();
    pool.save();
    pair.save();
    position.save();
    exchange.save();
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