import { useEffect, useRef, useState } from "react";

const HIDE_TIMEOUT_MS = 2 * 60 * 1000;

export const useTemporarilyHiddenModal = (isActive: boolean) => {
  const [isModalHidden, setIsModalHidden] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isActive]);

  const handleHideModal = () => {
    setIsModalHidden(true);
    // Auto-show modal after timeout
    hideTimeoutRef.current = setTimeout(() => {
      setIsModalHidden(false);
      hideTimeoutRef.current = null;
    }, HIDE_TIMEOUT_MS);
  };

  const handleShowModal = () => {
    setIsModalHidden(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  return {
    isModalHidden: isActive ? isModalHidden : false,
    handleHideModal,
    handleShowModal,
  };
};
