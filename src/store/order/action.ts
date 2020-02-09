import Order from 'types/order';

type OrderAction =
    | { type: 'SET_ORDERS', orders: Order[] }
    ;

export const setOrders = (orders: Order[]): OrderAction => {
    return { type: 'SET_ORDERS', orders };
};

export default OrderAction;
