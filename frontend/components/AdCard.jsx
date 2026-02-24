"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { TrendingUp, MousePointerClick, DollarSign, Medal, CheckCircle2, AlertTriangle, Eye, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import MediaModal from "./dashboard/MediaModal";

export default function AdCard({ ad, isSelectedForAB, onSelectForAB }) {
    const { nome_anuncio, imagem, video, copy_principal, titulo, metricas, is_winner } = ad;
    const [isVideoMetricsOpen, setIsVideoMetricsOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const handleCheckboxClick = (e) => {
        // Prevent click events from propagating if card itself were clickable
        if (onSelectForAB) {
            onSelectForAB(ad);
        }
    };

    const getHookTextColor = (rate) => {
        if (rate >= 30) return "text-green-600 font-bold";
        if (rate < 20) return "text-red-500 font-bold";
        return "text-gray-800 font-bold";
    };

    const getHookBgColor = (rate) => {
        if (rate >= 30) return "bg-green-500";
        if (rate < 20) return "bg-red-500";
        return "bg-blue-400";
    };

    const getHoldTextColor = (rate) => {
        if (rate >= 20) return "text-green-600 font-bold";
        if (rate < 10) return "text-red-500 font-bold";
        return "text-gray-800 font-bold";
    };

    const getHoldBgColor = (rate) => {
        if (rate >= 20) return "bg-green-500";
        if (rate < 10) return "bg-red-500";
        return "bg-blue-400";
    };

    const hookTextColor = getHookTextColor(metricas.hook_rate);
    const hookBgColor = getHookBgColor(metricas.hook_rate);
    const holdTextColor = getHoldTextColor(metricas.hold_rate);
    const holdBgColor = getHoldBgColor(metricas.hold_rate);

    const renderMedia = () => {
        if (video) {
            return (
                <a
                    href={video || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full relative cursor-pointer group bg-black block border-0 p-0"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <img src={imagem} alt={nome_anuncio} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                    </div>
                </a>
            );
        }
        if (imagem) {
            return (
                <button
                    type="button"
                    className="w-full h-full relative cursor-pointer group block border-0 p-0"
                    onClick={(e) => { e.stopPropagation(); setIsMediaModalOpen(true); }}
                >
                    <img src={imagem} alt={nome_anuncio} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
            );
        }
        return <span className="text-gray-400 text-sm">Sem Mídia</span>;
    };

    const getCtrTextColor = (ctr) => {
        if (ctr < 1) return 'text-red-600';
        if (ctr >= 2) return 'text-green-600';
        return 'text-gray-900';
    };

    const getCpaTextColor = (cpa) => {
        if (cpa > 50) return 'text-red-600';
        if (cpa < 20 && cpa > 0) return 'text-green-600';
        return 'text-gray-900';
    };

    return (
        <div
            className={`relative w-full max-w-sm flex flex-col rounded-xl overflow-hidden shadow-sm bg-white border transition-all hover:shadow-md ${is_winner ? "border-green-500 transform scale-[1.02] ring-1 ring-green-500" : "border-gray-200"
                } ${isSelectedForAB ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
        >
            {/* Cabeçalho Topo Simplificado */}
            <div className="px-4 py-3 border-b flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2 overflow-hidden">
                    {onSelectForAB !== undefined && (
                        <input
                            type="checkbox"
                            checked={!!isSelectedForAB}
                            onChange={handleCheckboxClick}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer shadow-sm shrink-0"
                            title="Selecionar para Combate (A/B)"
                        />
                    )}
                    <h3 className="text-sm font-semibold text-gray-800 truncate uppercase tracking-wider" title={nome_anuncio}>
                        {nome_anuncio}
                    </h3>
                </div>
                {ad.status === 'ACTIVE' && (
                    <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium shrink-0">
                        <CheckCircle2 size={12} /> Ativo
                    </span>
                )}
            </div>

            {/* Mídia (Imagem ou Vídeo) colada no topo */}
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative shrink-0">
                {/* Selo de Vencedor */}
                {is_winner && !metricas.fatigue && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 z-10 shadow-md">
                        <Medal size={12} /> Vencedor
                    </div>
                )}

                {/* Alerta de Fadiga */}
                {metricas.fatigue && (
                    <div className="absolute top-2 right-2 bg-red-600 animate-pulse text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 z-10 shadow-md" title="Saturação Alta">
                        <AlertTriangle size={12} /> Fadiga
                    </div>
                )}

                {renderMedia()}
            </div>

            {/* Corpo do Anúncio */}
            <div className="p-4 flex-1 flex flex-col bg-white">
                <div className="mb-4">
                    {titulo && <h4 className="font-bold text-gray-900 text-sm mb-1">{titulo}</h4>}
                    <p className="text-[13px] text-gray-600 line-clamp-3 leading-relaxed" title={copy_principal}>
                        {copy_principal || "Sem texto fornecido."}
                    </p>
                </div>

                {/* Box Funil */}
                <div className="mb-3 border border-gray-200 rounded-md p-3">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Funil do Anúncio</p>
                    <div className="flex items-center gap-1 w-full h-3 rounded-sm overflow-hidden bg-gray-100">
                        <div className="h-full bg-blue-300" style={{ width: '100%' }} title={`Impressões Estimadas: ${Math.round(metricas.clicks / (metricas.ctr / 100 || 1))}`}></div>
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (metricas.clicks / Math.round((metricas.clicks / (metricas.ctr / 100 || 1)) || 1)) * 100 * 5)}%` }} title={`Cliques: ${metricas.clicks}`}></div>
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(100, ((metricas.spend / metricas.cpa) / metricas.clicks) * 100 * 10)}%` }} title={`Conversões Est: ${Math.round(metricas.spend / metricas.cpa || 0)}`}></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-medium">
                        <span>Impressões</span>
                        <span>Cliques</span>
                        <span>Conversões</span>
                    </div>
                </div>

                {/* Box Atenção de Vídeo (Accordion) */}
                {(video || ad.is_video) && (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <button
                            onClick={() => setIsVideoMetricsOpen(!isVideoMetricsOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                <Eye size={12} /> Atenção do Vídeo
                            </span>
                            <span className="text-gray-400">
                                {isVideoMetricsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                        </button>

                        {isVideoMetricsOpen && (
                            <div className="px-3 pb-3 pt-1 border-t border-gray-50 animate-fadeIn">
                                <div className="mb-3">
                                    <div className="flex justify-between items-end text-xs mb-1">
                                        <span className="text-gray-600 font-medium">Hook Rate (3s)</span>
                                        <span className={hookTextColor}>{metricas.hook_rate?.toFixed(1) || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full ${hookBgColor}`} style={{ width: `${Math.min(100, metricas.hook_rate || 0)}%` }}></div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-0.5">Retenção inicial (Alvo: &gt;30%)</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end text-xs mb-1">
                                        <span className="text-gray-600 font-medium">Hold Rate (15s)</span>
                                        <span className={holdTextColor}>{metricas.hold_rate?.toFixed(1) || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full ${holdBgColor}`} style={{ width: `${Math.min(100, metricas.hold_rate || 0)}%` }}></div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-0.5">Retenção no meio (Alvo: &gt;20%)</p>
                                </div>

                                {/* Box Funil de Retenção Visualizações */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3">Funil de Retenção</h5>

                                    <div className="space-y-2">
                                        {(() => {
                                            const maxViews = Math.max(metricas.views25pct || 1, 1);
                                            const steps = [
                                                { label: "25% do vídeo", value: metricas.views25pct || 0, color: "bg-blue-50" },
                                                { label: "50% do vídeo", value: metricas.views50pct || 0, color: "bg-blue-100" },
                                                { label: "75% do vídeo", value: metricas.views75pct || 0, color: "bg-blue-200" },
                                                { label: "95% do vídeo", value: metricas.views95pct || 0, color: "bg-blue-300" },
                                                { label: "100% do vídeo", value: metricas.views100pct || 0, color: "bg-blue-400" },
                                            ];

                                            return steps.map((step) => (
                                                <div key={step.label} className="relative w-full h-7 bg-white flex items-center rounded overflow-hidden border border-gray-100">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full ${step.color} transition-all duration-500`}
                                                        style={{ width: `${Math.min(100, (step.value / maxViews) * 100)}%` }}
                                                    ></div>
                                                    <div className="relative w-full flex justify-between px-2.5 text-[11px] z-10">
                                                        <span className="text-slate-600 font-medium">{step.label}</span>
                                                        <span className="font-bold text-slate-700">{step.value} views</span>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Grid 2x2 Inferior */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1"><DollarSign size={10} /> Gasto</span>
                        <span className="text-[15px] font-bold text-gray-900 mt-0.5">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.spend)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1"><MousePointerClick size={10} /> Cliques</span>
                        <span className="text-[15px] font-bold text-gray-900 mt-0.5">{metricas.clicks}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1"><TrendingUp size={10} /> CTR</span>
                        <span className={`text-[15px] font-bold mt-0.5 ${getCtrTextColor(metricas.ctr)}`}>
                            {metricas.ctr.toFixed(2)}%
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1"><DollarSign size={10} /> CPA</span>
                        <span className={`text-[15px] font-bold mt-0.5 ${getCpaTextColor(metricas.cpa)}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.cpa)}
                        </span>
                    </div>
                </div>

                {metricas.roas > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">ROAS (Retorno)</span>
                        {metricas.roas >= 2 && <span className="font-bold text-xs px-2 py-0.5 rounded text-green-700 bg-green-50">{metricas.roas.toFixed(2)}x</span>}
                        {metricas.roas < 1 && <span className="font-bold text-xs px-2 py-0.5 rounded text-red-700 bg-red-50">{metricas.roas.toFixed(2)}x</span>}
                        {metricas.roas >= 1 && metricas.roas < 2 && <span className="font-bold text-xs px-2 py-0.5 rounded text-blue-600 bg-blue-50">{metricas.roas.toFixed(2)}x</span>}
                    </div>
                )}
            </div>

            <MediaModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                mediaUrl={video || imagem}
                isVideo={!!video}
                title={nome_anuncio}
            />
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
            impressions: PropTypes.number,
            hook_rate: PropTypes.number,
            hold_rate: PropTypes.number,
            views25pct: PropTypes.number,
            views50pct: PropTypes.number,
            views75pct: PropTypes.number,
            views95pct: PropTypes.number,
            views100pct: PropTypes.number,
            fatigue: PropTypes.bool
        }).isRequired,
        is_video: PropTypes.bool
    }).isRequired,
    isSelectedForAB: PropTypes.bool,
    onSelectForAB: PropTypes.func
};
