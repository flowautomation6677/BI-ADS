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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
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
