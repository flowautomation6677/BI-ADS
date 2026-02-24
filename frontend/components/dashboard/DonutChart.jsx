import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function DonutChart({ adsets }) {
    if (!adsets || adsets.length === 0) return null;

    // Filter adsets with spend > 0 and sort
    const data = adsets
        .filter(a => a.metricas.spend > 0)
        .map(a => ({ name: a.adset_name, value: a.metricas.spend }))
        .sort((a, b) => b.value - a.value);

    // If too many, group others
    let chartData = data;
    if (data.length > 5) {
        chartData = data.slice(0, 4);
        const othersSpend = data.slice(4).reduce((sum, item) => sum + item.value, 0);
        chartData.push({ name: 'Outros', value: othersSpend });
    }

    const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-800 self-start mb-2">Distribuição de Verba</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => formatBRL(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
