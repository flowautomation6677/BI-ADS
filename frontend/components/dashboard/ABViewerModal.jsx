import React from 'react';
import PropTypes from 'prop-types';
import { X, ArrowRightLeft, TrendingUp, MousePointerClick, DollarSign } from 'lucide-react';
import AdCard from '../AdCard';

export default function ABViewerModal({ isOpen, onClose, ads }) {
    if (!isOpen || ads?.length !== 2) return null;

    const [ad1, ad2] = ads;

    // Helper to determine winner styling
    const getWinnerColor = (val1, val2, isHigherBetter = true) => {
        if (val1 === val2) return "text-gray-800";
        if (isHigherBetter) {
            return val1 > val2 ? "text-green-600 font-bold" : "text-gray-500";
        } else {
            return val1 < val2 ? "text-green-600 font-bold" : "text-gray-500";
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left">
            {/* Overlay Escuro */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <ArrowRightLeft size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Combate de Criativos (A/B)
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        {/* AD 1 */}
                        <div className="p-6 flex flex-col items-center">
                            <span className="bg-gray-100 text-gray-600 font-bold px-4 py-1 rounded-full mb-6 z-10 shadow-sm border border-gray-200 uppercase text-xs tracking-wider">
                                Desafiante A
                            </span>
                            <div className="w-full max-w-sm pointer-events-none scale-95 origin-top mb-6">
                                <AdCard ad={ad1} />
                            </div>
                            <div className="w-full max-w-sm bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="text-sm font-bold text-center text-gray-500 mb-4 uppercase tracking-wider">Comparativo</h4>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><MousePointerClick size={14} /> Cliques</span>
                                        <span className={`text-base ${getWinnerColor(ad1.metricas.clicks, ad2.metricas.clicks, true)}`}>
                                            {ad1.metricas.clicks}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><TrendingUp size={14} /> CTR</span>
                                        <span className={`text-base ${getWinnerColor(ad1.metricas.ctr, ad2.metricas.ctr, true)}`}>
                                            {ad1.metricas.ctr?.toFixed(2) || 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><DollarSign size={14} /> CPA</span>
                                        <span className={`text-base ${getWinnerColor(ad1.metricas.cpa, ad2.metricas.cpa, false)}`}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad1.metricas.cpa)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">ROAS</span>
                                        <span className={`text-base ${getWinnerColor(ad1.metricas.roas, ad2.metricas.roas, true)}`}>
                                            {ad1.metricas.roas?.toFixed(2) || 0}x
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AD 2 */}
                        <div className="p-6 flex flex-col items-center bg-gray-50/30">
                            <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1 rounded-full mb-6 z-10 shadow-sm border border-blue-200 uppercase text-xs tracking-wider">
                                Desafiante B
                            </span>
                            <div className="w-full max-w-sm pointer-events-none scale-95 origin-top mb-6">
                                <AdCard ad={ad2} />
                            </div>
                            <div className="w-full max-w-sm bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-center text-gray-500 mb-4 uppercase tracking-wider">Comparativo</h4>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><MousePointerClick size={14} /> Cliques</span>
                                        <span className={`text-base ${getWinnerColor(ad2.metricas.clicks, ad1.metricas.clicks, true)}`}>
                                            {ad2.metricas.clicks}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><TrendingUp size={14} /> CTR</span>
                                        <span className={`text-base ${getWinnerColor(ad2.metricas.ctr, ad1.metricas.ctr, true)}`}>
                                            {ad2.metricas.ctr?.toFixed(2) || 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <span className="text-gray-600 flex items-center gap-1"><DollarSign size={14} /> CPA</span>
                                        <span className={`text-base ${getWinnerColor(ad2.metricas.cpa, ad1.metricas.cpa, false)}`}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad2.metricas.cpa)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">ROAS</span>
                                        <span className={`text-base ${getWinnerColor(ad2.metricas.roas, ad1.metricas.roas, true)}`}>
                                            {ad2.metricas.roas?.toFixed(2) || 0}x
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

ABViewerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ads: PropTypes.array
};
