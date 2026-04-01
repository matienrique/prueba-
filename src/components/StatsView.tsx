import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Check, X, MessageSquare, Download, AlertCircle } from 'lucide-react';
import { UserType } from '../types';

interface FeedbackEntry {
  choice: 'yes' | 'no' | null;
  comments: string;
  userType: UserType;
  userTypeLabel?: string;
  timestamp: string;
}

interface Props {
  onBack: () => void;
}

const StatsView: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Error al obtener el feedback');
      }
      const feedbackData = await response.json();
      setData(feedbackData.reverse()); // Show newest first
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('No se pudieron cargar las estadísticas. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const resolvedCount = data.filter(d => d.choice === 'yes').length;
  const notResolvedCount = data.filter(d => d.choice === 'no').length;

  const downloadCSV = () => {
    const headers = ['Fecha', 'Usuario', 'Resolvió duda', 'Comentarios'];
    const rows = data.map(f => [
      new Date(f.timestamp).toLocaleString(),
      f.userTypeLabel || f.userType,
      f.choice === 'yes' ? 'Si' : f.choice === 'no' ? 'No' : 'N/A',
      (f.comments || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_prosumidores_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 text-white rounded-xl shadow-lg">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Feedback</h2>
            <p className="text-sm text-gray-500 font-medium">Monitoreo de satisfacción de usuarios</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchFeedback}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-bold"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button 
            onClick={downloadCSV}
            disabled={data.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md font-bold disabled:opacity-50"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button 
            onClick={onBack}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md font-bold"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-shake">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Número</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Resolvió su consulta</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 font-bold">Cargando datos...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-400 font-bold">No hay feedback registrado aún.</p>
                  </td>
                </tr>
              ) : (
                data.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-400">#{data.length - index}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded uppercase tracking-tighter">
                        {entry.userTypeLabel || entry.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.choice === 'yes' ? (
                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                          <Check size={16} strokeWidth={3} />
                          <span>Si</span>
                        </div>
                      ) : entry.choice === 'no' ? (
                        <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                          <X size={16} strokeWidth={3} />
                          <span>No</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 italic max-w-md">
                        {entry.comments || entry.observation || <span className="text-gray-300">Sin comentarios</span>}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Consultas</p>
          <p className="text-4xl font-black text-gray-800">{data.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Resolvieron su consulta</p>
          <p className="text-4xl font-black text-gray-800">{resolvedCount}</p>
          <p className="text-xs font-bold text-gray-400 mt-1">
            {data.length > 0 ? ((resolvedCount / data.length) * 100).toFixed(1) : 0}% del total
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">No resolvieron su consulta</p>
          <p className="text-4xl font-black text-gray-800">{notResolvedCount}</p>
          <p className="text-xs font-bold text-gray-400 mt-1">
            {data.length > 0 ? ((notResolvedCount / data.length) * 100).toFixed(1) : 0}% del total
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
