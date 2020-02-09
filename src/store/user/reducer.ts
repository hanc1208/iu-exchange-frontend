import Action from 'store/action';
import User from 'types/user';

export interface UserState {
    me: User | null | undefined;
}

const DEFAULT_STATE: UserState = {
    me: undefined,
};

const user = (state: UserState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'SET_ME':
            return { ...state, me: action.me };
    }
    return state;
};

export default user;
