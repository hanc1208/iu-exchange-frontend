import axios from 'axios';

import { store } from '../index';
import { openModal } from 'store/modal/action';
import { gettext } from 'utils/translation';

const instance = axios.create();

instance.interceptors.response.use(
    undefined,
    (error: any) => {
        if (error.response) {
            if (error.response.status >= 400 && error.response.status < 500) {
                const modal = {
                    id: 'api-error',
                    title: gettext('Error'),
                    content: gettext(error.response.data.detail),
                };
                store.dispatch(openModal(modal));
            } else if (error.response.status >= 500 && error.response.status < 600) {
                const modal = {
                    id: 'api-error',
                    title: gettext('Error'),
                    content: gettext('Internal server error has been occurred.'),
                };
                store.dispatch(openModal(modal));
            }
        } else if (error.request) {
            const modal = {
                id: 'api-error',
                title: gettext('Error'),
                content: gettext('There is a problem with your internet connection or the server has an error.'),
            };
            store.dispatch(openModal(modal));
        }
        throw error;
    },
);

export default instance;
