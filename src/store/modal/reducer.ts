import Action from 'store/action';

import { Modal } from './action';

export interface ModalState {
    modals: Modal[];
}

const DEFAULT_STATE: ModalState = {
    modals: [],
};


const modal = (state: ModalState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'OPEN_MODAL': {
            console.log(action.modal.id);
            const modals = [...state.modals].filter(
                modal => modal.id !== action.modal.id
            );
            return { ...state, modals: [...modals, action.modal] };
        }
        case 'CLOSE_MODAL': {
            const modals = [...state.modals];
            modals.splice(
                state.modals.findIndex(modal => modal.id === action.id),
                1,
            );
            return { ...state, modals };
        }
    }
    return state;
};

export default modal;
