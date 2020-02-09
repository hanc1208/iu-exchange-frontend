import WebSocketAction from './action';

export interface WebSocketState {
    webSocket: WebSocket | null;
}

const DEFAULT_STATE: WebSocketState = {
    webSocket: null,
};

const webSocket = (state: WebSocketState = DEFAULT_STATE, action: WebSocketAction) => {
    switch (action.type) {
        case 'WEB_SOCKET_OPEN':
            return { ...state, webSocket: action.webSocket };
        case 'WEB_SOCKET_CLOSE':
            return { ...state, webSocket: null };
    }
    return state;
};

export default webSocket;
