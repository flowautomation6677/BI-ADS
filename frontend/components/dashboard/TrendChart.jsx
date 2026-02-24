import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function TrendChart({ data }) {
    const [metricLeft, setMetricLeft] = useState('cpa');
    const [metricRight, setMetricRight] = useState('roas');

    if (!data || data.length === 0) return null;

    // Remove empty data elements, sort by date
    const chartData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({
        ...d,
        formatedDate: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        // Derivar métricas caso não venham prontas no trend_data
        cpa: d.conversoes > 0 ? d.spend / d.conversoes : 0,
        roas: d.spend > 0 ? d.revenue / d.spend : 0,
        cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
        ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
    }));

    const formatters = {
        currency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
        percent: (value) => `${parseFloat(value).toFixed(2)}%`,
        number: (value) => parseFloat(value).toFixed(2),
        compact: (value) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value)
    };

    const AVAILABLE_METRICS = {
        spend: { key: 'spend', name: 'Gasto', color: '#3B82F6', format: formatters.currency },
        conversoes: { key: 'conversoes', name: 'Conversões', color: '#10B981', format: formatters.number },
        cpa: { key: 'cpa', name: 'CPA', color: '#EF4444', format: formatters.currency },
        roas: { key: 'roas', name: 'ROAS', color: '#8B5CF6', format: formatters.number },
        cpm: { key: 'cpm', name: 'CPM', color: '#F59E0B', format: formatters.currency },
        ctr: { key: 'ctr', name: 'CTR', color: '#0EA5E9', format: formatters.percent },
        revenue: { key: 'revenue', name: 'Receita', color: '#059669', format: formatters.currency },
        impressions: { key: 'impressions', name: 'Impressões', color: '#6366F1', format: formatters.compact },
        clicks: { key: 'clicks', name: 'Cliques', color: '#EC4899', format: formatters.compact },
    };

    const configLeft = AVAILABLE_METRICS[metricLeft];
    const configRight = AVAILABLE_METRICS[metricRight];

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800">
                    Tendência: {configLeft.name} vs. {configRight.name} Diário
                </h3>

                <div className="flex bg-gray-50 border border-gray-200 p-1.5 rounded-lg gap-2 items-center">
                    <select
                        value={metricLeft}
                        onChange={(e) => setMetricLeft(e.target.value)}
                        className="px-2 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.values(AVAILABLE_METRICS).map(m => (
                            <option key={`left-${m.key}`} value={m.key}>{m.name}</option>
                        ))}
                    </select>
                    <span className="text-gray-400 text-sm font-bold px-1">X</span>
                    <select
                        value={metricRight}
                        onChange={(e) => setMetricRight(e.target.value)}
                        className="px-2 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.values(AVAILABLE_METRICS).map(m => (
                            <option key={`right-${m.key}`} value={m.key}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="formatedDate"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(val) => configLeft.format(val)}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(val) => configRight.format(val)}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value, name) => {
                                if (name === configLeft.name) return [configLeft.format(value), name];
                                if (name === configRight.name) return [configRight.format(value), name];
                                return [value, name];
                            }}
                            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey={configLeft.key}
                            name={configLeft.name}
                            stroke={configLeft.color}
                            strokeWidth={3}
                            dot={{ strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey={configRight.key}
                            name={configRight.name}
                            stroke={configRight.color}

                            strokeWidth={3}
                            dot={{ strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
