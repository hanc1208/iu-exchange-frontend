import { ThunkAction } from 'redux-thunk';

import Action from 'store/action';
import { setBalances } from 'store/balance/action';
import { RootState } from 'store/reducer';
import { reconnectWebSocket } from 'store/webSocket/action';
import User from 'types/user';

type UserAction =
    | { type: 'SET_ME', me: User | null }
    ;

export const setMe = (
    (me: User | null) : ThunkAction<void, RootState, void, Action> => (dispatch, getState) => {
        const state = getState();
        if (me == null) {
            dispatch(setBalances({}));
        }
        dispatch({ type: 'SET_ME', me });
        if (me !== state.user.me) {
            dispatch(reconnectWebSocket());
        }
    }
);

export default UserAction;
