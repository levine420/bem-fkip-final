"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Native modal provides focus containment, inert background and Escape support. */
export function Modal({ children, label, onClose, busy = false, className = "" }: { children: ReactNode; label: string; onClose: () => void; busy?: boolean; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; trigger?.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={label} aria-busy={busy} className={`dialog-panel ${className}`} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget || busy) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>{children}</dialog>;
}
