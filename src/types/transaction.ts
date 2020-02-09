import Decimal from 'decimal.js';

type TransactionType = 'trade' | 'blockchain';

type BaseTransactionFields = 'id' | 'type' | 'createdAt' | 'currency' | 'amount';

type Transaction = TradeTransaction | BlockchainTransaction;

export default Transaction;

export class BaseTransaction {
    id: string;
    type: TransactionType;
    createdAt: Date;
    currency: string;
    amount: Decimal;

    static fromPayload(payload: any): Transaction {
        const fromPayloadMap = {
            'trade': TradeTransaction.fromPayload,
            'blockchain': BlockchainTransaction.fromPayload,
        };
        return fromPayloadMap[payload.type as TransactionType](payload);
    }

    static parsePayload(payload: any): Pick<BaseTransaction, Exclude<BaseTransactionFields, 'type'>> {
        return {
            id: payload.id,
            createdAt: new Date(payload.created_at),
            currency: payload.currency,
            amount: new Decimal(payload.amount),
        };
    }
}

type TradeTransactionFields = BaseTransactionFields;

export class TradeTransaction extends BaseTransaction {
    type: 'trade';

    constructor(transaction: Pick<TradeTransaction, TradeTransactionFields>) {
        super();
        Object.assign(this, transaction);
    }

    static fromPayload(payload: any): TradeTransaction {
        return new TradeTransaction({
            ...BaseTransaction.parsePayload(payload),
            type: 'trade',
        });
    }
}

type BlockchainTransactionFields = BaseTransactionFields | 'txId';

export class BlockchainTransaction extends BaseTransaction {
    type: 'blockchain';
    txId: string | null;

    constructor(transaction: Pick<BlockchainTransaction, BlockchainTransactionFields>) {
        super();
        Object.assign(this, transaction);
    }

    static fromPayload(payload: any): BlockchainTransaction {
        return new BlockchainTransaction({
            ...BaseTransaction.parsePayload(payload),
            type: 'blockchain',
            txId: payload.tx_id,
        });
    }
}

export class Deposit {
    id: string;
    createdAt: Date;
    currency: string;
    amount: Decimal;
    txId: string;
    confirmations: number;

    constructor(deposit: Pick<Deposit, 'id' | 'createdAt' | 'currency' | 'amount' | 'txId' | 'confirmations'>) {
        Object.assign(this, deposit)
    }

    static fromPayload(payload: any): Deposit {
        return new Deposit({
            id: payload.id,
            createdAt: new Date(payload.created_at),
            currency: payload.currency,
            amount: new Decimal(payload.amount),
            txId: payload.tx_id,
            confirmations: payload.confirmations,
        });
    }
}
