'use client'

import { DashboardLayout } from '@/components/layouts'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Badge,
  Spinner,
  Modal,
  ConfirmModal,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui'
import { useState } from 'react'

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleLogout = () => {
    alert('Logout clicked!')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <DashboardLayout
      companyName="Empresa Demo"
      userEmail="admin@inventoryflow.com"
      onLogout={handleLogout}
    >
      <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Design System Demo</h1>
            <p className="text-[var(--color-text-secondary)]">
              Todos los componentes del sistema de diseño de InventoryFlow
            </p>
          </div>

          {/* Typography Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tipografía</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1>Heading 1 - Playfair Display</h1>
                <h2>Heading 2 - Playfair Display</h2>
                <h3>Heading 3 - Playfair Display</h3>
                <p>Body text - Geist. Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <code>Monospace - JetBrains Mono: const price = 1234.56</code>
              </div>
            </CardContent>
          </Card>

          {/* Colors Section */}
          <Card>
            <CardHeader>
              <CardTitle>Paleta de Colores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="h-20 rounded-lg bg-[var(--color-primary)] mb-2" />
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">#1F2937</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg bg-[var(--color-accent)] mb-2" />
                  <p className="text-sm font-medium">Accent</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">#059669</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg bg-[var(--color-alert)] mb-2" />
                  <p className="text-sm font-medium">Alert</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">#DC2626</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg bg-[var(--color-success)] mb-2" />
                  <p className="text-sm font-medium">Success</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">#34D399</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Botones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" isLoading>
                  Loading...
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements Section */}
          <Card>
            <CardHeader>
              <CardTitle>Formularios</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <Input
                  label="Nombre del Producto"
                  placeholder="Ej: Laptop Dell XPS 13"
                  helperText="Nombre descriptivo del producto"
                />

                <Input
                  label="Stock Actual"
                  type="number"
                  placeholder="0"
                />

                <Input
                  label="Email con Error"
                  type="email"
                  placeholder="email@ejemplo.com"
                  error="El email es requerido"
                />

                <Select
                  label="Categoría"
                  options={[
                    { value: '', label: 'Seleccionar categoría' },
                    { value: 'electronics', label: 'Electrónica' },
                    { value: 'furniture', label: 'Muebles' },
                    { value: 'clothing', label: 'Ropa' }
                  ]}
                />

                <div className="flex gap-3">
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Guardar Producto
                  </Button>
                  <Button type="button" variant="secondary">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Cards Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover>
              <CardHeader>
                <CardTitle>Card con Hover</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-text-secondary)]">
                  Esta tarjeta tiene efecto hover con sombra y elevación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Normal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Stock Total</span>
                    <span className="font-mono font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Productos</span>
                    <span className="font-mono font-semibold">56</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-alert-light)] text-[var(--color-alert)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Bajo stock</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-success-light)] text-[var(--color-accent-hover)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Pedido aprobado</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Stock Normal</Badge>
                <Badge variant="warning">Advertencia</Badge>
                <Badge variant="danger">Bajo Stock</Badge>
                <Badge variant="info">Información</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Spinner Section */}
          <Card>
            <CardHeader>
              <CardTitle>Spinners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-[var(--color-text-secondary)]">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-[var(--color-text-secondary)]">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-[var(--color-text-secondary)]">Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="xl" />
                  <span className="text-xs text-[var(--color-text-secondary)]">Extra Large</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="success" title="Pedido aprobado">
                El pedido #1234 ha sido aprobado exitosamente y enviado al proveedor.
              </Alert>
              <Alert variant="warning" title="Stock bajo">
                El producto "Mouse Logitech MX" tiene solo 3 unidades disponibles.
              </Alert>
              <Alert variant="danger" title="Error">
                No se pudo conectar con el servidor. Por favor, intenta nuevamente.
              </Alert>
              <Alert variant="info" title="Información">
                Hay 2 pedidos pendientes de aprobación.
              </Alert>
            </CardContent>
          </Card>

          {/* Modal Section */}
          <Card>
            <CardHeader>
              <CardTitle>Modales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={() => setShowModal(true)}>
                  Abrir Modal
                </Button>
                <Button variant="danger" onClick={() => setShowConfirmModal(true)}>
                  Abrir Confirmación
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table Example */}
          <Card>
            <CardHeader>
              <CardTitle>Tabla de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Laptop Dell XPS 13</TableCell>
                    <TableCell numeric>45</TableCell>
                    <TableCell numeric>10</TableCell>
                    <TableCell>
                      <Badge variant="success">Normal</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mouse Logitech MX</TableCell>
                    <TableCell numeric>3</TableCell>
                    <TableCell numeric>15</TableCell>
                    <TableCell>
                      <Badge variant="danger">Bajo stock</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Teclado Mecánico</TableCell>
                    <TableCell numeric>120</TableCell>
                    <TableCell numeric>20</TableCell>
                    <TableCell>
                      <Badge variant="success">Normal</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Ejemplo de Modal"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Guardar
              </Button>
            </>
          }
        >
          <p className="text-[var(--color-text-primary)]">
            Este es un modal de ejemplo. Puedes agregar cualquier contenido aquí.
          </p>
          <div className="mt-4">
            <Input label="Nombre del producto" placeholder="Ingresa el nombre" />
          </div>
        </Modal>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            alert('Confirmado!')
            setShowConfirmModal(false)
          }}
          title="¿Estás seguro?"
          message="Esta acción no se puede deshacer. ¿Deseas continuar?"
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </DashboardLayout>
  )
}
