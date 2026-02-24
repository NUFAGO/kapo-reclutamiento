'use client';

import React, { useState } from 'react';
import { Plus, Search, X, Eye, FileText } from 'lucide-react';
import { Button, DataTable } from '@/components/ui';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CandidatoView from './components/candidato-view';
import { useCandidatos, type Candidato } from '@/hooks';

export default function CandidatosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  // Hook para obtener candidatos del backend
  const { candidatos, loading, error, refetch, totalCount } = useCandidatos({
    filtros: {
      limit,
      offset,
      nombres: searchQuery || undefined,
    },
    enabled: true
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleViewCandidato = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidato(null);
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'dni',
      header: 'DNI',
      className: 'text-left',
      render: (value: string) => (
        <span className="text-xs bg-gray-300/20 dark:bg-blue-100/20 text-gray-500 dark:text-gray-200 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'nombres',
      header: 'Nombres',
      className: 'text-left text-sm',
      render: (value: string, row: Candidato) => {
        const fullName = `${value} ${row.apellidoPaterno} ${row.apellidoMaterno}`.trim();
        return (
          <div className="min-w-0 max-w-full">
            <div className="font-medium text-xs leading-none truncate">
              {fullName}
            </div>
          </div>
        );
      }
    },
    {
      key: 'correo',
      header: 'Correo',
      className: 'text-left text-xs',
      render: (value: string) => (
        <div className="line-clamp-1">
          {value}
        </div>
      )
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (value: string) => (
        <span className="text-xs">
          {value}
        </span>
      )
    },
    {
      key: 'totalAplicaciones',
      header: 'Aplicaciones',
      render: (value: number) => (
        <span className="text-xs bg-blue-300/20 dark:bg-blue-100/20 text-blue-400 dark:text-blue-200 px-2 py-1 rounded">
          {value || 0}
        </span>
      )
    },
    {
      key: 'fechaRegistro',
      header: 'Fecha Registro',
      render: (value: string) => (
        <span className="text-xs">
          {value ? new Date(value).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'N/A'}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'w-24 text-center',
      render: (value: any, row: Candidato) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="subtle"
            color="gray"
            size="icon"
            title="Ver detalles"
            onClick={() => handleViewCandidato(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.curriculumUrl && (
            <Button
              variant="subtle"
              color="primary"
              size="icon"
              title="Ver CV"
              onClick={() => window.open(row.curriculumUrl, '_blank')}
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Candidatos
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Gestión de todos los candidatos registrados
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-background backdrop-blur-sm rounded-lg card-shadow p-4">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              placeholder="Buscar candidatos..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 text-xs h-8"
            />
          </div>

          {/* Botón limpiar búsqueda */}
          {searchQuery && (
            <Button
              onClick={clearSearch}
              variant="custom"
              color="violet"
              icon={<X className="h-4 w-4" />}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de Candidatos */}
      <DataTable
        data={candidatos}
        columns={columns}
        subtitle={`Total: ${totalCount} candidatos`}
        showPagination={true}
        serverPagination={{
          currentPage,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          onPageChange: (page: number) => setCurrentPage(page)
        }}
        loading={loading}
        emptyMessage="Los candidatos aparecerán aquí cuando se registren"
      />

      {/* Modal para ver detalles de candidato */}
      <CandidatoView
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        candidato={selectedCandidato}
      />
    </div>
  );
}
