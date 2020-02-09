import Decimal from 'decimal.js';

import Action from 'store/action';
import Order from 'types/order';

export interface OrderState {
    orders: Order[];
}

const DEFAULT_STATE: OrderState = {
    orders: [],
};

const order = (state: OrderState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'WEB_SOCKET_MESSAGE':
            if (action.message.type === 'order') {
                const orders = [
                    ...action.message.data.buy.map(([price, volume]: [string, string]) => ({
                        price: new Decimal(price),
                        volume: new Decimal(volume),
                        side: 'buy',
                    })),
                    ...action.message.data.sell.map(([price, volume]: [string, string]) => ({
                        price: new Decimal(price),
                        volume: new Decimal(volume),
                        side: 'sell',
                    })),
                ];
                return { ...state, orders };
            }
            break;
        case 'SET_ORDERS':
            return { ...state, orders: action.orders };
    }
    return state;
};

export default order;
