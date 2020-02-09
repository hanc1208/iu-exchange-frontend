import { ThunkAction } from 'redux-thunk';

import { RootState } from 'store/reducer';

type WebSocketAction =
    | { type: 'WEB_SOCKET_OPEN', webSocket: WebSocket }
    | { type: 'WEB_SOCKET_CLOSE' }
    | { type: 'WEB_SOCKET_MESSAGE', message: { type: string, data: any } }
    ;

export const connectWebSocket = (
    (url: string): ThunkAction<void, RootState, void, WebSocketAction> => dispatch => {
        const webSocket = new WebSocket(url);
        webSocket.onopen = () => {
            dispatch({ type: 'WEB_SOCKET_OPEN', webSocket });
        };
        webSocket.onclose = (e: CloseEvent) => {
            dispatch({ type: 'WEB_SOCKET_CLOSE' });
            if (!e.wasClean) {
                webSocket.close();
                setTimeout(() => dispatch(connectWebSocket(url)), 1000);
            }
        };
        webSocket.onerror = () => {
            webSocket.close();
        };
        webSocket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            dispatch({ type: 'WEB_SOCKET_MESSAGE', message });
        };
    }
);

export const reconnectWebSocket = (
    (): ThunkAction<void, RootState, void, WebSocketAction> => (dispatch, getState) => {
        const { webSocket: { webSocket } } = getState();
        if (!webSocket) return;
        webSocket.close();
        dispatch(connectWebSocket(webSocket.url));
    }
);

export default WebSocketAction;
