import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

import PropTypes from 'prop-types';

export default function CPAHorizontalBar({ adsets }) {
    if (!adsets || adsets.length === 0) return null;

    // Remove empty ones and sort by CPA ascending
    const data = adsets
        .filter(a => a.metricas.cpa > 0)
        .map(a => ({ name: a.adset_name, cpa: a.metricas.cpa }))
        .sort((a, b) => a.cpa - b.cpa);

    const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 w-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 self-start mb-4">CPA por Conjunto (Menor é Melhor)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            type="number"
                            tickFormatter={(val) => `R$${val}`}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            formatter={(value) => formatBRL(value)}
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="cpa" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.cpa > 50 ? '#EF4444' : '#10B981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

CPAHorizontalBar.propTypes = {
    adsets: PropTypes.array,
};
