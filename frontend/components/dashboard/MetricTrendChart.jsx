import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const AVAILABLE_METRICS = {
    cpa: { key: 'cpa', name: 'CPA', color: '#EF4444', format: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) },
    spend: { key: 'spend', name: 'Gasto', color: '#3B82F6', format: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) },
    roas: { key: 'roas', name: 'ROAS', color: '#8B5CF6', format: (v) => parseFloat(v).toFixed(2) },
    conversoes: { key: 'conversoes', name: 'Conversões', color: '#10B981', format: (v) => parseFloat(v).toFixed(0) },
    revenue: { key: 'revenue', name: 'Receita', color: '#059669', format: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) },
    cpm: { key: 'cpm', name: 'CPM', color: '#F59E0B', format: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) },
    ctr: { key: 'ctr', name: 'CTR', color: '#0EA5E9', format: (v) => `${parseFloat(v).toFixed(2)}%` },
    impressions: { key: 'impressions', name: 'Impressões', color: '#6366F1', format: (v) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v) },
    clicks: { key: 'clicks', name: 'Cliques', color: '#EC4899', format: (v) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v) },
};

const CustomTooltip = ({ active, payload, label, config }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ borderRadius: '10px', background: '#fff', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.13)', border: '1px solid #f1f5f9', padding: '10px 16px', minWidth: 160 }}>
            <p style={{ color: '#374151', fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</p>
            <p style={{ color: config.color, fontWeight: 600, fontSize: 15 }}>
                {config.name}: {config.format(payload[0]?.value ?? 0)}
            </p>
        </div>
    );
};

export default function MetricTrendChart({ data }) {
    const [metric, setMetric] = useState('cpa');

    if (!data || data.length === 0) return null;

    const config = AVAILABLE_METRICS[metric];

    const chartData = [...data]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(d => ({
            ...d,
            formatedDate: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            cpa: d.conversoes > 0 ? d.spend / d.conversoes : 0,
            roas: d.spend > 0 ? d.revenue / d.spend : 0,
            cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
            ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
        }));

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800">
                        Tendência: <span style={{ color: config.color }}>{config.name}</span> Diário
                    </h3>
                </div>

                <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-50 border border-gray-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.values(AVAILABLE_METRICS).map(m => (
                        <option key={m.key} value={m.key}>{m.name}</option>
                    ))}
                </select>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.color} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="formatedDate"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => config.format(v)}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip config={config} />} />
                        <Area
                            type="monotone"
                            dataKey={config.key}
                            name={config.name}
                            stroke={config.color}
                            strokeWidth={2.5}
                            fill={`url(#grad-${metric})`}
                            dot={{ r: 3, strokeWidth: 2, stroke: config.color, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: config.color }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
