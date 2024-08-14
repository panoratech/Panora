"use client"
import React, { useState } from 'react'
import {X} from 'lucide-react'


interface ModalProps {
  open: boolean;
  setOpen: (op: boolean) => void;
  children: React.ReactNode;
  backgroundClass?: string;
  contentClass?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  setOpen,
  children,
  backgroundClass = "bg-black/20 backdrop-blur ",
  contentClass = ""
}) => {
  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className={`
        fixed inset-0 flex justify-center items-center transition-colors
        ${backgroundClass}
      `}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
        ${contentClass} transition-all
        `}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal