"use client";

import { useState } from "react";
import { Copy, Plus, CheckCircle2, ExternalLink } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    nome_cliente: "",
    ad_account_id_facebook: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedLink(null);
    setCopied(false);

    try {
      // In production, use NEXT_PUBLIC_API_URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/relatorio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao criar relatório");
      }

      const data = await res.json();
      const baseUrl = typeof window === 'object' ? globalThis.window.location.origin : '';
      setGeneratedLink(`${baseUrl}/report/${data.id_unico}`);

      // Clear form after success
      setFormData({
        nome_cliente: "",
        ad_account_id_facebook: "",
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Crie novos relatórios para seus clientes e gere links seguros de compartilhamento.
            </p>
          </div>

          <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nome_cliente" className="block text-sm font-medium text-gray-700">
                Nome do Cliente
              </label>
              <div className="mt-1">
                <input
                  id="nome_cliente"
                  name="nome_cliente"
                  type="text"
                  required
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: Start BI - Ecom"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ad_account_id_facebook" className="block text-sm font-medium text-gray-700">
                Ad Account ID (Facebook)
              </label>
              <div className="mt-1">
                <input
                  id="ad_account_id_facebook"
                  name="ad_account_id_facebook"
                  type="text"
                  required
                  value={formData.ad_account_id_facebook}
                  onChange={(e) => setFormData({ ...formData, ad_account_id_facebook: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: act_1555843605744369"
                />
              </div>
            </div>



            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  "Gerando Relatório..."
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Gerar Link de Relatório
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link Result Area */}
          {generatedLink && (
            <div className="mt-8 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Relatório gerado com sucesso!</h3>
              <p className="text-sm text-gray-500 mb-3">
                Envie este link para o seu cliente acessar o dashboard:
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>

                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
