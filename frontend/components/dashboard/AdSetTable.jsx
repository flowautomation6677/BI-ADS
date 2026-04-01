/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { exportTableToPDF } from '@/utils/exportUtils';

const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function AdSetTable({ data, onRowClick }) {
    const [sorting, setSorting] = useState([{ id: 'spend', desc: true }]);

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('adset_name', {
            header: 'Conjunto de Anúncios',
            cell: info => <span className="font-semibold text-gray-900 cursor-pointer">{info.getValue()}</span>,
        }),
        columnHelper.accessor(row => row.metricas.spend, {
            id: 'spend',
            header: 'Gasto',
            cell: info => formatBRL(info.getValue()),
        }),
        columnHelper.accessor(row => row.metricas.reach, {
            id: 'reach',
            header: 'Alcance',
            cell: info => info.getValue()?.toLocaleString('pt-BR') || 0,
        }),
        columnHelper.accessor(row => row.metricas.impressions, {
            id: 'impressions',
            header: 'Impressões',
            cell: info => info.getValue()?.toLocaleString('pt-BR') || 0,
        }),
        columnHelper.accessor(row => row.metricas.cpm, {
            id: 'cpm',
            header: 'CPM',
            cell: info => {
                const val = info.getValue() || 0;

                let bgColor = 'text-gray-700';
                if (val > 40 && val <= 80) bgColor = 'bg-orange-50 text-orange-700 font-medium'; // Warning
                if (val > 80) bgColor = 'bg-red-50 text-red-700 font-medium'; // Very Expensive

                return (
                    <span className={`px-2 py-1 rounded-md ${bgColor}`}>
                        {formatBRL(val)}
                    </span>
                );
            }
        }),
        columnHelper.accessor(row => row.metricas.ctr, {
            id: 'ctr',
            header: 'CTR',
            cell: info => {
                const val = info.getValue() || 0;

                let bgColor = 'text-gray-700';
                if (val < 1) bgColor = 'bg-red-50 text-red-700 font-bold'; // Low CTR
                else if (val >= 2) bgColor = 'bg-green-50 text-green-700 font-bold'; // High CTR

                return (
                    <span className={`px-2 py-1 rounded-md ${bgColor}`}>
                        {val.toFixed(2)}%
                    </span>
                );
            }
        }),
        columnHelper.accessor(row => row.metricas.clicks, {
            id: 'clicks',
            header: 'Cliques no Link',
            cell: info => info.getValue()?.toLocaleString('pt-BR') || 0,
        }),
        columnHelper.accessor(row => row.metricas.conversoes, {
            id: 'conversoes',
            header: 'Leads',
            cell: info => info.getValue() || 0,
        }),
        columnHelper.accessor(row => row.metricas.cpa, {
            id: 'cpa',
            header: 'CPA',
            cell: info => {
                const val = info.getValue() || 0;
                let bgColor = 'text-gray-700'; // Default
                if (val > 0 && val < 20) bgColor = 'bg-green-50 text-green-700 font-medium'; // Good
                else if (val > 50) bgColor = 'bg-red-50 text-red-700 font-medium'; // Bad

                return (
                    <span className={`px-2 py-1 rounded-md ${bgColor}`}>
                        {formatBRL(val)}
                    </span>
                );
            }
        }),

        columnHelper.accessor(row => row.metricas.frequency, {
            id: 'frequency',
            header: 'Freq.',
            cell: info => {
                const val = info.getValue() || 0;
                // Highlight high frequency (ad fatigue)
                const isFatigued = val > 3;
                return (
                    <span className={`px-2 py-1 rounded-md ${isFatigued ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-600'}`}>
                        {val.toFixed(2)}
                    </span>
                );
            }
        }),
    ], []);

    const table = useReactTable({
        data: data || [],
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleExportPDF = () => {
        const columns = [
            { header: 'Conjunto', dataKey: 'adset_name' },
            { header: 'Gasto', dataKey: 'spend', format: 'currency' },
            { header: 'Alcance', dataKey: 'reach', format: 'number' },
            { header: 'Impressões', dataKey: 'impressions', format: 'number' },
            { header: 'CPM', dataKey: 'cpm', format: 'currency' },
            { header: 'CTR', dataKey: 'ctr', format: 'percentage' },
            { header: 'Cliques', dataKey: 'clicks', format: 'number' },
            { header: 'Leads', dataKey: 'conversoes', format: 'number' },
            { header: 'CPA', dataKey: 'cpa', format: 'currency' },
            { header: 'Freq.', dataKey: 'frequency' }
        ];

        // Mapear os dados para um formato plano
        const flatData = (data || []).map(row => ({
            adset_name: row.adset_name,
            spend: row.metricas?.spend || 0,
            reach: row.metricas?.reach || 0,
            impressions: row.metricas?.impressions || 0,
            cpm: row.metricas?.cpm || 0,
            ctr: row.metricas?.ctr || 0,
            clicks: row.metricas?.clicks || 0,
            conversoes: row.metricas?.conversoes || 0,
            cpa: row.metricas?.cpa || 0,
            frequency: Number(row.metricas?.frequency || 0).toFixed(2)
        }));

        exportTableToPDF('Relatório de Conjuntos de Anúncios', columns, flatData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Conjuntos Ativos</h3>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                >
                    <Download size={16} /> Exportar PDF
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                <span className="text-gray-400 group-hover:text-gray-600">
                                                    {{
                                                        asc: <ArrowUp size={14} />,
                                                        desc: <ArrowDown size={14} />,
                                                    }[header.column.getIsSorted()] ?? <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                                                </span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick?.(row.original)}
                                className="hover:bg-blue-50 transition-colors cursor-pointer group"
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

AdSetTable.propTypes = {
    data: PropTypes.array.isRequired,
    onRowClick: PropTypes.func,
};
