
import { BigInt } from '@graphprotocol/graph-ts';
import { InvestsToBasicPool, PairInvestorBasicPool } from '../../generated/schema';
import { Invest, PositionOpen, PositionClose, PositionRemoved } from '../../generated/templates/BasicPool/BasicPool'
import { getBasicPool } from '../entities/BasicTraderPool';
import { getExchangeToBasicPool } from '../entities/ExchangeToBasicPool';
import { getInvestor } from '../entities/Investor'
import { getPositionForBasicPool, getPositionForBasicPoolByIndex } from '../entities/Position';
//import { runTests } from "../../tests/BasicTraderPool.test"

export function onInvest(event: Invest): void{
    let investor = getInvestor(event.params.investor);
    let pool = getBasicPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    
    let investToBasicPool = new InvestsToBasicPool(event.transaction.hash.toHex());
    investToBasicPool.investorToPool = pair.id;
    investToBasicPool.amount = event.params.amount;

    investor.save();
    pool.save();
    pair.save();
    investToBasicPool.save();
}

export function onOpen(event: PositionOpen): void {
    let investor = getInvestor(event.params.sender);
    let pool = getBasicPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    let position = getPositionForBasicPool(pool.id, event.params.to, event.params.from);
    
    let exchange = getExchangeToBasicPool(event.transaction.hash.toHex(), investor, pair, event.params.amount, position);

    investor.save();
    pool.save();
    pair.save();
    position.save();
    exchange.save();
}

export function onClose(event: PositionClose): void {
    let investor = getInvestor(event.params.sender);
    let pool = getBasicPool(event.params.pool);
    let pair = getPair(investor.id, pool.id);
    let position = getPositionForBasicPool(pool.id, event.params.from, event.params.to);
    
    let exchange = getExchangeToBasicPool(event.transaction.hash.toHex(), investor, pair, event.params.amount.neg(), position);

    investor.save();
    pool.save();
    pair.save();
    position.save();
    exchange.save();
}

export function onRemove(event: PositionRemoved): void {
    let pool = getBasicPool(event.params.pool);
    let position = getPositionForBasicPoolByIndex(pool.id, event.params.from, event.params.to, BigInt.fromI32(0));
    
    position.positionNumber = position.positionNumber.plus(BigInt.fromI32(1));
    
    pool.save();
    position.save();
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
}