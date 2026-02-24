import React from 'react';
import { DollarSign, MousePointerClick, Target, TrendingUp } from 'lucide-react';

export default function KPICards({ overview }) {
    if (!overview) return null;

    const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Dynamic coloring based on thresholds (mocked for UAU factor)
    const roasColor = overview.roas >= 2 ? 'text-green-600' : (overview.roas < 1 ? 'text-red-500' : 'text-yellow-600');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            {/* Card 1: Investimento */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Investimento Total</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(overview.spend)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Card 2: Conversões / CPA (Merged insight) */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Conversões (Aprox.)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{overview.conversoes}</h3>
                        <p className="text-xs text-gray-400 mt-1">CPA Médio: <span className="font-semibold text-gray-700">{formatCurrency(overview.cpa)}</span></p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Target size={24} />
                    </div>
                </div>
            </div>

            {/* Card 3: ROAS */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">ROAS Geral</p>
                        <h3 className={`text-2xl font-bold ${roasColor}`}>
                            {overview.roas.toFixed(2)}x
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* Card 4: Cliques */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total de Cliques</p>
                        <h3 className="text-2xl font-bold text-gray-900">{overview.clicks}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <MousePointerClick size={24} />
                    </div>
                </div>
            </div>

        </div>
    );
}
