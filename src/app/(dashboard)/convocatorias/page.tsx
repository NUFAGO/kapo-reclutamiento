'use client';

import React, { useState } from 'react';
import { Plus, Search, X, Eye, Link, FileText, Settings } from 'lucide-react';
import { Button, DataTable, Select } from '@/components/ui';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ConvocatoriaView from './components/convocatoria-view';
import ConvocatoriaPdf from './components/convocatoria-pdf';
import FormularioConfigModal from './components/convocatoria-form';
import { useConvocatorias, type Convocatoria } from '@/hooks';
import { graphqlRequest } from '@/lib/graphql-client';
import { CREAR_FORMULARIO_CONFIG_MUTATION, ACTUALIZAR_FORMULARIO_CONFIG_MUTATION } from '@/graphql/mutations';
import { OBTENER_FORMULARIO_CONFIG_QUERY } from '@/graphql/queries';

export default function ConvocatoriasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [existingFormConfig, setExistingFormConfig] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEstado, setSelectedEstado] = useState<string>('');

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Aplicar filtros al servidor
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEstadoChange = (value: string | null) => {
    setSelectedEstado(value || '');
    setCurrentPage(1); // Reset to first page when filtering
  };

  const filters = searchQuery.trim() || selectedEstado ? {
    ...(searchQuery.trim() && {
      codigo_convocatoria: searchQuery,
      cargo_nombre: searchQuery,
      categoria_nombre: searchQuery,
      especialidad_nombre: searchQuery
    }),
    ...(selectedEstado && { estado_convocatoria: selectedEstado })
  } : undefined;

  // Hook para obtener convocatorias del backend
  const { convocatorias, loading, error, refetch, totalCount } = useConvocatorias({
    limit,
    offset,
    filters,
    enabled: true
  });

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedEstado('');
  };

  const handleViewConvocatoria = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConvocatoria(null);
  };

  const handleViewPdf = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setIsPdfModalOpen(true);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setSelectedConvocatoria(null);
  };

  const handleViewFormConfig = async (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);

    try {
      // Intentar cargar configuración existente
      const response = await graphqlRequest(OBTENER_FORMULARIO_CONFIG_QUERY, {
        convocatoriaId: convocatoria.id
      });

      setExistingFormConfig(response.formularioConfigPorConvocatoria);
    } catch (error) {
      // Si no existe configuración, será null (se creará una nueva)
      setExistingFormConfig(null);
    }

    // Esperar un tick para asegurar que el estado se actualice antes de abrir el modal
    setTimeout(() => {
      setIsFormModalOpen(true);
    }, 0);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedConvocatoria(null);
    setExistingFormConfig(null);
  };

  const handleSaveFormConfig = async (config: any) => {
    try {
      // Determinar si es creación o actualización
      const isUpdate = config.id && existingFormConfig;

      let inputData;
      if (isUpdate) {
        // Para actualización, incluir solo campos permitidos
        inputData = {
          titulo: config.titulo,
          descripcion: config.descripcion,
          campos: config.campos,
          estado: config.estado,
          urlPublico: config.urlPublico,
          tokenJwt: config.tokenJwt,
          fechaPublicacion: config.fechaPublicacion,
          fechaExpiracion: config.fechaExpiracion
        };
      } else {
        // Para creación, incluir campos base más campos adicionales
        inputData = {
          convocatoriaId: config.convocatoriaId,
          titulo: config.titulo,
          descripcion: config.descripcion,
          campos: config.campos,
          estado: config.estado,
          urlPublico: config.urlPublico,
          tokenJwt: config.tokenJwt,
          fechaPublicacion: config.fechaPublicacion,
          fechaExpiracion: config.fechaExpiracion,
          creadoPor: '507f1f77bcf86cd799439011' // ID dummy temporal - TODO: obtener del contexto de autenticación
        };
      }

      const mutation = isUpdate ? ACTUALIZAR_FORMULARIO_CONFIG_MUTATION : CREAR_FORMULARIO_CONFIG_MUTATION;
      const variables = isUpdate
        ? { id: config.id, input: inputData }
        : { input: inputData };

      const response = await graphqlRequest(mutation, variables);

      // Refrescar la lista de convocatorias para mostrar cambios
      refetch();

      return response;
    } catch (error) {
      console.error('Error al guardar configuración de formulario:', error);
      throw error;
    }
  };

  // Configuración de estados para el componente DataTable
  // Nota: Solo "ACTIVA" muestra punto visual, los demás estados están preparados para futuro uso
  const statusConfig = {
    ACTIVA: { label: 'Activa', color: 'bg-green-500' },
    EN_PROCESO: { label: 'En Proceso', color: 'bg-gray-500' },
    FINALIZADA: { label: 'Finalizada', color: 'bg-orange-500' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-500' },
    // Estados adicionales preparados para el futuro
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-500' },
    PAUSADA: { label: 'Pausada', color: 'bg-orange-500' },
    SUSPENDIDA: { label: 'Suspendida', color: 'bg-red-500' },
    BORRADOR: { label: 'Borrador', color: 'bg-slate-500' }
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'codigo_convocatoria',
      header: 'Código',
      className: 'text-left',
      render: (value: string) => (
        <span className="text-xs bg-gray-300/20 dark:bg-blue-100/20 text-gray-500 dark:text-gray-200 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'cargo_nombre',
      header: 'Cargo',
      className: 'text-xs min-w-0 text-left',
      render: (value: string, row: Convocatoria) => {
        const lines = [
          value || 'No especificado',
          row.especialidad_nombre
        ].filter(Boolean);

        // Máximo 2 líneas
        const displayLines = lines.slice(0, 2);

        return (
          <div className="min-w-0 max-w-full">
            <div className="font-medium text-xs leading-none truncate">
              {displayLines[0]}
            </div>
            {displayLines[1] && (
              <div className="text-xs text-text-secondary leading-none truncate">
                {displayLines[1]}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'estado_convocatoria',
      header: 'Estado',
      render: (value: string) => {
        const status = statusConfig[value as keyof typeof statusConfig];
        if (!status) return value;



        return (
          <div className="flex items-center justify-center gap-2">

            <span className={`status-dot size-1.5 rounded-full ${status.color}`}></span>
            <span className="text-sm">{status.label}</span>
          </div>
        );
      }
    },
    {
      key: 'vacantes',
      header: 'Vacantes',
      render: (value: number) => (
        <span className="text-xs bg-blue-300/20 dark:bg-blue-100/20 text-blue-400 dark:text-blue-200 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'empresa_nombre',
      header: 'Empresa',
      className: 'text-left text-xs',
      render: (value: string) => (
        <div className="line-clamp-2">
          {value || 'No especificada'}
        </div>
      )
    },
    {
      key: 'obra_nombre',
      header: 'Obra/Proyecto',
      className: 'text-left text-xs',
      render: (value: string) => (
        <div className="line-clamp-2">
          {value || 'No especificada'}
        </div>
      )
    },
    {
      key: 'fecha_creacion',
      header: 'Fecha Creación',
      render: (value: string) => (
        <span className="text-xs">
          {new Date(value).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'w-24 text-center',
      render: (value: any, row: Convocatoria) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="subtle"
            color="gray"
            size="icon"
            title="Ver detalles"
            onClick={() => handleViewConvocatoria(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="subtle"
            color="danger"
            size="icon"
            title="Ver PDF"
            onClick={() => handleViewPdf(row)}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="subtle"
            color="success"
            size="icon"
            title="Configurar Formulario"
            onClick={() => handleViewFormConfig(row)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="subtle"
            color="primary"
            size="icon"
            title="Abrir enlace"
          >
            <Link className="h-3.5 w-3.5" />
          </Button>
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
            Convocatorias
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Gestión de todos los proyectos con convocatorias
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
              placeholder="Busca por código o nombre del cargo"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 text-xs h-8"
            />
          </div>

          {/* Select Estado */}
          <div className="w-48">
            <Select
              value={selectedEstado}
              onChange={handleEstadoChange}
              options={[
                { value: 'ACTIVA', label: 'Activa' },
                { value: 'FINALIZADA', label: 'Finalizada' },
              ]}
              placeholder="Filtrar por estado"
              className="text-xs h-8"
            />
          </div>

          {/* Botón limpiar búsqueda */}
          {(searchQuery || selectedEstado) && (
            <Button
              onClick={clearSearch}
              variant="custom"
              color="blue"

            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de Convocatorias */}
      <DataTable
        data={convocatorias}
        columns={columns}
        subtitle={`Total: ${totalCount} convocatorias`}
        showPagination={true}
        serverPagination={{
          currentPage,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          onPageChange: (page: number) => setCurrentPage(page)
        }}
        statusConfig={statusConfig}
        loading={loading}
        emptyMessage="Las convocatorias aparecerán aquí cuando se agreguen"
      />

      {/* Espacio adicional abajo como mencionó el usuario */}
      <div className="space-y-3 mt-8">



      </div>

      {/* Modal para ver detalles de convocatoria */}
      <ConvocatoriaView
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        convocatoria={selectedConvocatoria}
      />

      {/* Modal para ver PDF de convocatoria */}
      <ConvocatoriaPdf
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        convocatoria={selectedConvocatoria}
      />

      {/* Modal para configurar formulario */}
      {selectedConvocatoria && (
        <FormularioConfigModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          onSave={handleSaveFormConfig}
          convocatoriaId={selectedConvocatoria.id}
          tituloConvocatoria={`${selectedConvocatoria.cargo_nombre || 'Sin cargo'} ${selectedConvocatoria.especialidad_nombre ? `(${selectedConvocatoria.especialidad_nombre})` : ''} - ${selectedConvocatoria.codigo_convocatoria}`.trim()}
          configExistente={existingFormConfig}
        />
      )}
    </div>
  );
}