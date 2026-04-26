import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../compartido/api';

interface RespuestaSalud {
  estado: string;
  timestamp: string;
  version: string;
}

async function consultarSalud(): Promise<RespuestaSalud> {
  const { data } = await clienteApi.get<RespuestaSalud>('/health');
  return data;
}

export default function Inicio() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['salud'],
    queryFn: consultarSalud,
    refetchInterval: 30_000,
  });

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sistema CAL</h1>
        <p className="mt-1 text-gray-500">Cambridge Academy of Languages</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-72">
        <h2 className="text-sm font-medium text-gray-600 mb-3">Estado de la API</h2>

        {isLoading && (
          <span className="inline-flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
            Verificando...
          </span>
        )}

        {isError && (
          <span className="inline-flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            API: Sin conexión
          </span>
        )}

        {data && (
          <>
            <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
              API: OK
            </span>
            <p className="mt-3 text-xs text-gray-400">
              Versión {data.version} &middot;{' '}
              {new Date(data.timestamp).toLocaleString('es-CO')}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
