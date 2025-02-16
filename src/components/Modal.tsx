import { ReactNode } from 'react';
import CloseIcon from '../assets/icons/close.svg';

type ModalProps = {
  title: string;
  status: 'success' | 'error' | 'confirm';
  children: ReactNode;
  onClose: () => void;
};

function Modal({ title, status, children, onClose }: ModalProps) {
  return (
    <div className={`modal ${status}`}>
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        <button className='modal-close' onClick={onClose}><img src={CloseIcon} alt="" /></button>
      </div>
    </div>
  );
}

export default Modal;
