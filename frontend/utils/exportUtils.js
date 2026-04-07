"use client";

export const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Parses any date string safely — avoids Invalid Date when the string already has timezone info
const safeFormatDate = (dateStr, fmt, formatFn) => {
    try {
        const dt = new Date(dateStr);
        return isNaN(dt.getTime()) ? String(dateStr) : formatFn(dt, fmt);
    } catch {
        return String(dateStr);
    }
};

// Excel sheet names: max 31 chars, no \ / ? * [ ] : chars
const toSafeSheetName = (name) =>
    name.split('').filter(c => !'\\/?*[]:'.includes(c)).join('').slice(0, 31).trim() || 'Campanha';

/**
 * Exporta dados de uma tabela genérica para um arquivo PDF.
 * @param {string} title Titulo do relatorio
 * @param {Array} columns Ex: [{ header: 'Campanha', dataKey: 'campaign_name' }, ...]
 * @param {Array} data Ex: [{ campaign_name: 'Camp. 1', spend: 'R$ 10,00', ... }]
 */
export const exportTableToPDF = async (title, columns, data) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { format } = await import('date-fns');
    const { ptBR } = await import('date-fns/locale');

    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);

    const rows = data.map(item =>
        columns.map(col => {
            let val = item[col.dataKey];
            if (col.format === 'currency') val = formatBRL(val);
            if (col.format === 'percentage') val = `${Number(val || 0).toFixed(2)}%`;
            if (col.format === 'number') val = Number(val || 0).toLocaleString('pt-BR');
            return val ?? '';
        })
    );

    autoTable(doc, {
        startY: 35,
        head: [columns.map(col => col.header)],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`${title.toLowerCase().replaceAll(' ', '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Exporta dados diários de MÚLTIPLAS campanhas em um único XLSX (uma aba por campanha).
 * @param {string} clientName Nome do cliente / relatório
 * @param {Array<{ campaignName: string, dailyData: Array }>} campaigns
 */
export const exportAllCampaignsDailyToXLSX = async (clientName, campaigns) => {
    if (!campaigns?.length) return;

    const XLSX = await import('xlsx');
    const { saveAs } = await import('file-saver');
    const { format } = await import('date-fns');

    const workbook = XLSX.utils.book_new();

    for (const { campaignName, dailyData } of campaigns) {
        if (!dailyData?.length) continue;

        const mappedData = dailyData.map(d => ({
            'Data': safeFormatDate(d.date, 'dd/MM/yyyy', format),
            'Gasto (R$)': d.spend,
            'Impressões': d.impressions,
            'Alcance': d.reach,
            'Cliques': d.clicks,
            'CTR (%)': Number(d.ctr || 0).toFixed(2),
            'CPM (R$)': d.cpm,
            'Leads': d.conversoes,
            'CPA (R$)': d.cpa,
            'Receita (R$)': d.revenue,
            'ROAS': Number(d.roas || 0).toFixed(2),
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);

        worksheet['!cols'] = [
            { wch: 12 }, { wch: 13 }, { wch: 13 }, { wch: 10 },
            { wch: 10 }, { wch: 9 }, { wch: 11 }, { wch: 8 },
            { wch: 11 }, { wch: 13 }, { wch: 8 },
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, toSafeSheetName(campaignName));
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const safeClient = clientName.replaceAll(' ', '_');
    saveAs(dataBlob, `Campanhas_Diario_${safeClient}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

/**
 * Transforma e exporta os dados diários recebidos da API para XLSX.
 * @param {string} campaignName Nome da campanha
 * @param {Array} dailyData Dados diários do endpoint `/daily`
 */
export const exportDailyDataToXLSX = async (campaignName, dailyData) => {
    if (!dailyData?.length) return;

    const XLSX = await import('xlsx');
    const { saveAs } = await import('file-saver');
    const { format } = await import('date-fns');

    const mappedData = dailyData.map(d => ({
        'Data': safeFormatDate(d.date, 'dd/MM/yyyy', format),
        'Gasto (R$)': d.spend,
        'Impressões': d.impressions,
        'Alcance': d.reach,
        'Cliques': d.clicks,
        'CTR (%)': Number(d.ctr || 0).toFixed(2),
        'CPM (R$)': d.cpm,
        'Leads': d.conversoes,
        'CPA (R$)': d.cpa,
        'Receita (R$)': d.revenue,
        'ROAS': Number(d.roas || 0).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evolução Diária');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(dataBlob, `Evolucao_Diaria_${campaignName.replaceAll(' ', '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

/**
 * Transforma e exporta os dados diários recebidos da API para PDF.
 * @param {string} campaignName Nome da campanha
 * @param {Array} dailyData Dados diários do endpoint `/daily`
 */
export const exportDailyDataToPDF = async (campaignName, dailyData) => {
    if (!dailyData?.length) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { format } = await import('date-fns');
    const { ptBR } = await import('date-fns/locale');

    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text(`Evolução Diária: ${campaignName}`, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);

    const headers = ['Data', 'Gasto', 'Impressões', 'Alcance', 'Cliques', 'CTR', 'CPM', 'Leads', 'CPA', 'Receita', 'ROAS'];

    const rows = dailyData.map(d => [
        safeFormatDate(d.date, 'dd/MM/yyyy', format),
        formatBRL(d.spend),
        d.impressions?.toLocaleString('pt-BR'),
        d.reach?.toLocaleString('pt-BR'),
        d.clicks?.toLocaleString('pt-BR'),
        `${Number(d.ctr || 0).toFixed(2)}%`,
        formatBRL(d.cpm),
        d.conversoes,
        formatBRL(d.cpa),
        formatBRL(d.revenue),
        `${Number(d.roas || 0).toFixed(2)}x`,
    ]);

    autoTable(doc, {
        startY: 35,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
    });

    doc.save(`Evolucao_Diaria_${campaignName.replaceAll(' ', '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
