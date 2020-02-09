import React from 'react';

import { randomBytes } from 'crypto';

export interface Modal {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    onClose?(): void;
}

type ModalAction =
    | { type: 'OPEN_MODAL', modal: Modal }
    | { type: 'CLOSE_MODAL', id: string }
    ;

export const openModal = (modal: Omit<Modal, 'id'> & { id?: string }): ModalAction => {
    const id = modal.id || randomBytes(16).toString("hex");
    return { type: 'OPEN_MODAL', modal: { ...modal, id } };
};

export const closeModal = (id: string): ModalAction => {
    return { type: 'CLOSE_MODAL', id };
};

export default ModalAction;
