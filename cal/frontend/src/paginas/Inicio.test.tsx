import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../compartido/api', () => ({
  clienteApi: {
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

import Inicio from './Inicio';
import { clienteApi } from '../compartido/api';

function envolverQuery(ui: React.ReactElement) {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={cliente}>{ui}</QueryClientProvider>;
}

const mockGet = clienteApi.get as ReturnType<typeof vi.fn>;

describe('Inicio', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({
      data: { estado: 'ok', timestamp: '2026-01-01T00:00:00.000Z', version: '0.1.0' },
    });
  });

  it('muestra el título del sistema', () => {
    render(envolverQuery(<Inicio />));
    expect(screen.getByText('Sistema CAL')).toBeInTheDocument();
  });

  it('muestra la descripción del sistema', () => {
    render(envolverQuery(<Inicio />));
    expect(screen.getByText('Cambridge Academy of Languages')).toBeInTheDocument();
  });

  it('muestra badge "API: OK" cuando la API responde exitosamente', async () => {
    render(envolverQuery(<Inicio />));
    await waitFor(() => {
      expect(screen.getByText('API: OK')).toBeInTheDocument();
    });
  });

  it('muestra badge "API: Sin conexión" cuando la API falla', async () => {
    mockGet.mockRejectedValue(new Error('Error de red'));
    render(envolverQuery(<Inicio />));
    await waitFor(() => {
      expect(screen.getByText('API: Sin conexión')).toBeInTheDocument();
    });
  });
});
