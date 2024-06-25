import React from 'react'
import {X} from 'lucide-react'

const Modal = ({open,setOpen,children} : {open:boolean,setOpen: React.Dispatch<React.SetStateAction<boolean>>,children: React.ReactNode}) => {
  return (
    <div
      onClick={() => setOpen(false)}
      className={`
        fixed inset-0 flex justify-center items-center transition-colors
        ${open ? "visible bg-black/20 backdrop-blur" : "invisible"}
      `}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
        bg-[#1d1d1d] border-green-900 rounded-xl shadow p-6 transition-all
          ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
        `}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-[#1d1d1d]"
        >
          <X color='gray' />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal