import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children }) {

    // Bloquear scroll do body quando aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">

            {/* Overlay Escuro */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Painel Deslizante */}
            <div className="relative w-full max-w-4xl bg-gray-50 shadow-2xl h-full flex flex-col transform transition-transform animate-slideInRight">

                {/* Header do Drawer */}
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo com scroll */}
                <div className="p-6 overflow-y-auto flex-1 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
