"use client";

import React from "react";
import PropTypes from "prop-types";
import { TrendingUp, MousePointerClick, DollarSign, Medal, CheckCircle2 } from "lucide-react";

export default function AdCard({ ad }) {
    const { nome_anuncio, imagem, video, copy_principal, titulo, metricas, is_winner } = ad;

    return (
        <div
            className={`relative w-full max-w-sm rounded-xl overflow-hidden shadow-lg bg-white border-2 transition-all hover:shadow-xl ${is_winner ? "border-green-500 transform scale-[1.02]" : "border-gray-100"
                }`}
        >
            {/* Selo de Vencedor */}
            {is_winner && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1 z-10 shadow-md">
                    <Medal size={16} /> Vencedor
                </div>
            )}

            {/* Cabeçalho do Anúncio (Simulando o Gerenciador de Anúncios) */}
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 truncate pr-4" title={nome_anuncio}>
                    {nome_anuncio}
                </h3>
                {ad.status === 'ACTIVE' && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={12} /> Ativo
                    </span>
                )}
            </div>

            {/* Mídia (Imagem ou Vídeo) */}
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {video && (
                    <video
                        src={video}
                        poster={imagem}
                        controls
                        className="w-full h-full object-cover"
                    >
                        <track kind="captions" />
                    </video>
                )}
                {!video && imagem && (
                    <img
                        src={imagem}
                        alt={nome_anuncio}
                        className="w-full h-full object-cover"
                    />
                )}
                {!video && !imagem && (
                    <span className="text-gray-400">Sem Imagem</span>
                )}
            </div>

            {/* Copy / Texto */}
            <div className="p-4 bg-gray-50 border-b">
                {titulo && <h4 className="font-bold text-gray-900 mb-1">{titulo}</h4>}
                <p className="text-sm text-gray-600 line-clamp-3" title={copy_principal}>
                    {copy_principal || "Sem texto fornecido."}
                </p>
            </div>

            {/* Métricas */}
            <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-4">

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><DollarSign size={12} /> Gasto</span>
                        <span className="font-bold text-gray-800 mt-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.spend)}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><MousePointerClick size={12} /> Cliques</span>
                        <span className="font-bold text-gray-800 mt-1">{metricas.clicks}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp size={12} /> CTR</span>
                        <span className="font-bold text-gray-800 mt-1">{metricas.ctr.toFixed(2)}%</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><DollarSign size={12} /> CPA</span>
                        <span className="font-bold text-gray-800 mt-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.cpa)}
                        </span>
                    </div>

                </div>

                {/* ROAS se existir */}
                {metricas.roas > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">ROAS (Retorno)</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {metricas.roas.toFixed(2)}x
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

AdCard.propTypes = {
    ad: PropTypes.shape({
        nome_anuncio: PropTypes.string.isRequired,
        imagem: PropTypes.string,
        video: PropTypes.string,
        copy_principal: PropTypes.string,
        titulo: PropTypes.string,
        status: PropTypes.string,
        is_winner: PropTypes.bool,
        metricas: PropTypes.shape({
            spend: PropTypes.number.isRequired,
            clicks: PropTypes.number.isRequired,
            ctr: PropTypes.number.isRequired,
            cpa: PropTypes.number.isRequired,
            roas: PropTypes.number.isRequired,
        }).isRequired
    }).isRequired
};
