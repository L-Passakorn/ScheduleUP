import clsx from "clsx";
import { useRouter } from "next/router";
import { useEffect, useRef, useCallback } from "react";

export type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: ModalProps): React.ReactElement => {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (onClose) onClose();
  }, [router.asPath]);

  useEffect(() => {
    const handleWindowClick = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [isOpen, onClose]);

  const handleCloseModal = useCallback((): void => {
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <div
      className={clsx(
        !isOpen && "hidden",
        "fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto font-noto"
      )}
      id="modal"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      onClick={handleCloseModal}
    >
      <div className="flex max-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-80"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block w-full transform overflow-hidden rounded-lg bg-Grey-200 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:align-middle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="bg-Grey-200 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
