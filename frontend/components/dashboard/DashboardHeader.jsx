import React, { useState } from 'react';
import { ChevronRight, Calendar, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

import PropTypes from 'prop-types';

export default function DashboardHeader({
    cliente,
    kpi,
    level,
    campaignName,
    adsetName,
    dateRange = '30d',
    onDateRangeChange,
    onKpiChange,
    onBreadcrumbClick
}) {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const dateRanges = [
        { label: 'Hoje', value: 'today' },
        { label: 'Ontem', value: 'yesterday' },
        { label: 'Últimos 7 dias', value: '7d' },
        { label: 'Últimos 14 dias', value: '14d' },
        { label: 'Últimos 30 dias', value: '30d' },
        { label: 'Mês Atual', value: 'this_month' },
        { label: 'Mês Passado', value: 'last_month' },
        { label: 'Máximo', value: 'maximum' },
        { label: 'Personalizado', value: 'custom' },
    ];
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Breadcrumbs */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <button
                        onClick={() => onBreadcrumbClick('campaign')}
                        className={`hover:text-blue-600 transition-colors ${level === 'campaign' ? 'text-blue-600 font-bold' : ''}`}
                    >
                        Todas as Campanhas
                    </button>

                    {campaignName && (
                        <>
                            <ChevronRight size={16} className="text-gray-400" />
                            <button
                                onClick={() => onBreadcrumbClick('adset')}
                                className={`hover:text-blue-600 truncate max-w-[150px] transition-colors ${level === 'adset' ? 'text-blue-600 font-bold' : ''}`}
                            >
                                {campaignName}
                            </button>
                        </>
                    )}

                    {adsetName && (
                        <>
                            <ChevronRight size={16} className="text-gray-400" />
                            <button
                                className="truncate max-w-[150px] text-blue-600 font-bold"
                            >
                                {adsetName}
                            </button>
                        </>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    Relatório de {cliente}
                </h1>
            </div>

            {/* Global Controls / Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 pl-3 pr-2 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-blue-300">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">KPI Alvo</span>
                    <div className="relative">
                        <select
                            value={kpi?.toUpperCase() || 'ROAS'}
                            onChange={(e) => onKpiChange && onKpiChange(e.target.value)}
                            className="text-sm font-extrabold text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors pl-2.5 pr-8 py-1 rounded-md cursor-pointer outline-none appearance-none"
                            style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%231D4ED8%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.65em auto' }}
                        >
                            <option value="ROAS">ROAS</option>
                            <option value="CPA">CPA</option>
                            <option value="CTR">CTR</option>
                        </select>
                    </div>
                </div>

                {/* Date Picker Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setIsDatePickerOpen(!isDatePickerOpen);
                            setShowCustomPicker(false);
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <Calendar size={16} className="text-blue-600" />
                        <span>{dateRanges.find(r => r.value === dateRange)?.label || (dateRange.includes(',') ? 'Personalizado' : 'Selecione...')}</span>
                    </button>

                    {isDatePickerOpen && !showCustomPicker && (
                        <>
                            <button
                                type="button"
                                aria-label="Fechar seletor de datas"
                                className="fixed inset-0 z-10 w-full h-full bg-transparent cursor-default focus:outline-none"
                                onClick={() => setIsDatePickerOpen(false)}
                            ></button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {dateRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => {
                                            if (range.value === 'custom') {
                                                setShowCustomPicker(true);
                                            } else {
                                                onDateRangeChange(range.value);
                                                setIsDatePickerOpen(false);
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${dateRange === range.value ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'}`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {isDatePickerOpen && showCustomPicker && (
                        <>
                            <button
                                type="button"
                                aria-label="Fechar calendário"
                                className="fixed inset-0 z-10 w-full h-full bg-transparent cursor-default"
                                onClick={() => setIsDatePickerOpen(false)}
                            ></button>
                            <div className="absolute right-0 mt-2 p-3 bg-white border border-gray-100 rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(dates) => {
                                        const [start, end] = dates;
                                        setStartDate(start);
                                        setEndDate(end);
                                        if (start && end) {
                                            const fmtStart = start.toISOString().split('T')[0];
                                            const fmtEnd = end.toISOString().split('T')[0];
                                            onDateRangeChange(`${fmtStart},${fmtEnd}`);
                                            setIsDatePickerOpen(false);
                                            setShowCustomPicker(false);
                                        }
                                    }}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    inline
                                    locale={ptBR}
                                    maxDate={new Date()}
                                />
                            </div>
                        </>
                    )}
                </div>

                <button className="flex items-center justify-center bg-gray-100 border border-gray-200 w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors relative group">
                    <Filter size={16} />
                    <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Mais Filtros
                    </span>
                </button>
            </div>
        </div>
    );
}

DashboardHeader.propTypes = {
    cliente: PropTypes.string,
    kpi: PropTypes.string,
    level: PropTypes.string,
    campaignName: PropTypes.string,
    adsetName: PropTypes.string,
    dateRange: PropTypes.string,
    onDateRangeChange: PropTypes.func,
    onKpiChange: PropTypes.func,
    onBreadcrumbClick: PropTypes.func
};
