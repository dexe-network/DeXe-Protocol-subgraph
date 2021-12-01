import { InvestsToInvestPool, PairInvestorInvestPool } from '../../generated/schema';
import { Invest } from '../../generated/templates/InvestPool/InvestPool'
import { getInvestPool } from '../entities/InvestTraderPool';
import { getInvestor } from '../entities/Investor'
import { getPositionForInvestPool, getPositionForInvestPoolByIndex } from '../entities/Position';
import { getExchangeToInvestPool } from '../entities/ExchangeToInvestPool';
import { PositionClose, PositionOpen, PositionRemoved } from '../../generated/templates/BasicPool/BasicPool';
import { BigInt } from '@graphprotocol/graph-ts';

//import { runTests } from "../../tests/BasicTraderPool.test"
export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getInvestPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToPool = new InvestsToInvestPool(event.transaction.hash.toHex());
    investToPool.investorToPool = pair.id;
    investToPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToPool.save();
}


export function onOpen(event: PositionOpen): void {
    let investor = getInvestor(event.params.sender);
    let pool = getInvestPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    let position = getPositionForInvestPool(pool.id, event.params.to, event.params.from);
    
    let exchange = getExchangeToInvestPool(event.transaction.hash.toHex(), investor, pair, event.params.amount, position);

    investor.save();
    pool.save();
    pair.save();
    position.save();
    exchange.save();
}

export function onClose(event: PositionClose): void {
    let investor = getInvestor(event.params.sender);
    let pool = getInvestPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    let position = getPositionForInvestPool(pool.id, event.params.from, event.params.to);
    
    let exchange = getExchangeToInvestPool(event.transaction.hash.toHex(), investor, pair, event.params.amount.neg(), position);

    investor.save();
    pool.save();
    pair.save();
    position.save();
    exchange.save();
}


export function onRemove(event: PositionRemoved): void {
    let pool = getInvestPool(event.params.pool);
    let position = getPositionForInvestPoolByIndex(pool.id, event.params.from, event.params.to, BigInt.fromI32(0));
    
    position.positionNumber = position.positionNumber.plus(BigInt.fromI32(1));
    
    pool.save();
    position.save();
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