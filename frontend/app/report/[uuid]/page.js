"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AdCard from "@/components/AdCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICards from "@/components/dashboard/KPICards";
import TrendChart from "@/components/dashboard/TrendChart";
import CampaignTable from "@/components/dashboard/CampaignTable";
import AdSetTable from "@/components/dashboard/AdSetTable";
import Drawer from "@/components/dashboard/Drawer";
import DonutChart from "@/components/dashboard/DonutChart";
import CPAHorizontalBar from "@/components/dashboard/CPAHorizontalBar";
import ABViewerModal from "@/components/dashboard/ABViewerModal";
import { ArrowLeft } from "lucide-react";

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const uuid = params?.uuid;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);

    // A/B Viewer State
    const [abSelectedAds, setAbSelectedAds] = useState([]);

    const handleSelectForAB = (ad) => {
        setAbSelectedAds(prev => {
            const isSelected = prev.find(a => a.id === ad.id);
            if (isSelected) {
                return prev.filter(a => a.id !== ad.id); // unselect
            }
            if (prev.length < 2) {
                return [...prev, ad]; // add
            }
            // limit to 2 - replace the oldest
            return [prev[1], ad];
        });
    };

    // Gestão de Estado via URL (Deep Linking)
    const dateRange = searchParams.get('dateRange') || '30d';
    const campaignId = searchParams.get('campaignId');
    const adsetId = searchParams.get('adsetId');
    const kpi = searchParams.get('kpi'); // opcional

    // Computa objetos selecionados a partir do id da URL
    const selectedCampaign = data?.campanhas?.find(c => c.campaign_id === campaignId) || null;
    const selectedAdSet = selectedCampaign?.conjuntos?.find(a => a.adset_id === adsetId) || null;

    let level = 'campaign';
    if (selectedAdSet) level = 'adset';
    else if (selectedCampaign) level = 'campaign_detail';

    useEffect(() => {
        let progressInterval;
        let timeoutId;
        async function fetchReport() {
            try {
                setLoading(true);
                setLoadingProgress(0);

                progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        const next = prev + (prev < 50 ? 5 : prev < 80 ? 2 : prev < 95 ? 1 : 0);
                        return next > 95 ? 95 : next;
                    });
                }, 100);

                // Calcula as datas com base no dateRange selecionado (opcional caso o backend faça)
                // Enviando dateRange direto na querystring para o backend interpretar
                const query = new URLSearchParams();
                query.append('dateRange', dateRange);
                if (kpi) query.append('kpi', kpi);

                // Em produção, usar process.env.NEXT_PUBLIC_API_URL
                const res = await fetch(`http://localhost:3001/api/relatorio/${uuid}?${query.toString()}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Erro ao carregar o relatório");
                }
                const json = await res.json();

                clearInterval(progressInterval);
                setLoadingProgress(100);

                timeoutId = setTimeout(() => {
                    setData(json);
                    setLoading(false);
                }, 400);
            } catch (err) {
                clearInterval(progressInterval);
                setError(err.message);
                setLoading(false);
            }
        }
        if (uuid) {
            fetchReport();
        }
        return () => {
            if (progressInterval) clearInterval(progressInterval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [uuid, dateRange, kpi]); // dependência em dateRange e kpi faz refetch automático!

    // Handle Deep Linking / Handlers
    const updateUrlParams = (updates) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) newParams.delete(key);
            else newParams.set(key, value);
        });
        router.push(`?${newParams.toString()}`, { scroll: false });
    };

    const handleDateRangeChange = (newRange) => {
        updateUrlParams({ dateRange: newRange, campaignId: null, adsetId: null });
    };

    const handleKpiChange = (newKpi) => {
        updateUrlParams({ kpi: newKpi, campaignId: null, adsetId: null });
    };

    const handleCampaignClick = (campaign) => {
        updateUrlParams({ campaignId: campaign.campaign_id, adsetId: null });
    };

    const handleAdSetClick = (adset) => {
        updateUrlParams({ adsetId: adset.adset_id });
    };

    const handleBreadcrumbClick = (targetLevel) => {
        if (targetLevel === 'campaign') {
            updateUrlParams({ campaignId: null, adsetId: null });
        } else if (targetLevel === 'adset') {
            updateUrlParams({ adsetId: null });
        }
    };

    const closeDrawer = () => {
        updateUrlParams({ campaignId: null, adsetId: null });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                        {/* Anel de fundo */}
                        <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                        {/* Anel giratório */}
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                        {/* Porcentagem */}
                        <div className="absolute inset-0 flex items-center justify-center mt-0.5">
                            <span className="text-sm font-bold text-gray-700">{loadingProgress}%</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-2">Construindo Relatório</h2>
                    <p className="text-sm text-gray-500 mb-6 text-center">
                        Coletando informações das campanhas, organizando métricas e preparando os gráficos...
                    </p>

                    {/* Barra de progresso */}
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <div className="w-full flex justify-between text-xs text-gray-400 font-medium px-1">
                        <span>Conectando...</span>
                        <span>{loadingProgress === 100 ? 'Finalizado!' : 'Processando...'}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Ops!</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data?.campanhas?.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 shrink-0">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório de {data?.cliente || "Desconhecido"}</h1>
                <p className="text-gray-500">Nenhuma campanha ativa encontrada no período analisado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            <DashboardHeader
                cliente={data.cliente}
                kpi={data.kpi_analisado}
                level={level === 'campaign_detail' ? 'campaign' : level}
                campaignName={selectedCampaign?.campaign_name}
                adsetName={selectedAdSet?.adset_name}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onKpiChange={handleKpiChange}
                onBreadcrumbClick={handleBreadcrumbClick}
            />

            <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

                {/* Nível 1: Visão Geral (Sempre visível no fundo) */}
                <KPICards overview={data.overview} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <TrendChart data={data.trend_data} />
                    </div>
                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Campanhas Ativas</h3>
                        <CampaignTable
                            data={data.campanhas}
                            onRowClick={handleCampaignClick}
                        />
                    </div>
                </div>

            </main>

            {/* Slide-over / Drawer para Nível 2 e Nível 3 */}
            <Drawer
                isOpen={!!selectedCampaign}
                onClose={closeDrawer}
                title={selectedAdSet ? `Anúncios em: ${selectedAdSet.adset_name}` : `Conjuntos em: ${selectedCampaign?.campaign_name}`}
            >
                {/* Header Interno do Drawer com de navegação */}
                {selectedAdSet && (
                    <div className="mb-6 flex">
                        <button
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams.toString());
                                newParams.delete('adsetId'); // Remove o adset para "voltar"
                                router.push(`/report/${uuid}?${newParams.toString()}`);
                                setAbSelectedAds([]); // limpar seleções
                            }}
                            className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-full transition-all duration-200 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow"
                        >
                            <ArrowLeft size={16} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
                            Voltar para Conjuntos
                        </button>
                    </div>
                )}

                {(!selectedAdSet && selectedCampaign) && (
                    // Nível 2: Lista de Conjuntos (A Batalha de Públicos)
                    <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <DonutChart adsets={selectedCampaign.conjuntos} />
                            <CPAHorizontalBar adsets={selectedCampaign.conjuntos} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-4 px-1 mt-4">Tabela de Conjuntos</h3>
                        <AdSetTable
                            data={selectedCampaign.conjuntos}
                            onRowClick={handleAdSetClick}
                        />
                    </div>
                )}

                {selectedAdSet && (
                    // Nível 3: Criativos em Grid (O Micro)
                    <div className="animate-fadeIn relative">
                        {/* Indicador Flutuante se tiver 1 selecionado */}
                        {abSelectedAds.length === 1 && (
                            <div className="sticky top-[70px] z-30 mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm shadow-sm flex items-center justify-between">
                                <span>Selecione mais 1 anúncio para iniciar o combate A/B.</span>
                                <button onClick={() => setAbSelectedAds([])} className="text-blue-500 font-bold hover:underline">Cancelar</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {selectedAdSet.anuncios.map(ad => (
                                <AdCard
                                    key={ad.id}
                                    ad={ad}
                                    isSelectedForAB={abSelectedAds.some(a => a.id === ad.id)}
                                    onSelectForAB={handleSelectForAB}
                                />
                            ))}
                        </div>

                        {/* Modal Aberto Quando 2 Selecionados */}
                        <ABViewerModal
                            isOpen={abSelectedAds.length === 2}
                            onClose={() => setAbSelectedAds([])}
                            ads={abSelectedAds}
                        />
                    </div>
                )}
            </Drawer>
        </div>
    );
}
