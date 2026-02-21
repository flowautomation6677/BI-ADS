"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdCard from "@/components/AdCard";

export default function ReportPage() {
    const params = useParams();
    const uuid = params?.uuid;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReport() {
            try {
                // Altere localhost:3001 para a URL do seu backend em produção
                const res = await fetch(`http://localhost:3001/api/relatorio/${uuid}`);

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Erro ao carregar o relatório");
                }

                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (uuid) {
            fetchReport();
        }
    }, [uuid]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    if (!data?.anuncios?.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 shrink-0">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório de {data?.cliente || "Desconhecido"}</h1>
                <p className="text-gray-500">Nenhum anúncio ativo encontrado no período analisado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header do Relatório */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Relatório de Performance
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Cliente: <span className="font-semibold text-gray-700">{data.cliente}</span>
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <span className="text-sm text-gray-500">Métrica Principal:</span>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {data.kpi_analisado}
                        </span>
                    </div>
                </div>

                {/* Grid de Anúncios */}
                <div className="flex justify-center items-start w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-center mx-auto">
                        {data.anuncios.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
