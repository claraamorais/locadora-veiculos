
import type { ReactNode } from "react";
import Button from "../Button";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

export default function Modal({
  aberto,
  titulo,
  children,
  onClose,
  onConfirm,
}: ModalProps) {
  if (!aberto) {
    return null;
  }

  return (
    <>
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal-titulo">
                {titulo}
              </h5>
            </div>

            <div className="modal-body">
              {children}
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancelar
              </Button>

              <Button
                variant="danger"
                onClick={onConfirm}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop show"></div>
    </>
  );
}
