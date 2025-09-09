"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Button } from "flowbite-react";
import {
  FaUser,
  FaSignOutAlt,
  FaFileContract,
  FaFileInvoice,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ¡Bienvenido de vuelta, {session?.user?.name}!
            </p>
          </div>
          <Button color="gray" onClick={handleSignOut}>
            <FaSignOutAlt className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <FaUser className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {session?.user?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {session?.user?.email}
                </p>
                <div className="mt-1">
                  {session?.user?.emailVerified ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓ Email verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      ⚠ Email sin verificar
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/profile/edit">
                <Button color="blue">
                  <FaUser className="mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <FaFileContract className="text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Generar Contratos
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Crea contratos de compraventa profesionales
            </p>
            <Link href="/generador_contratos">
              <Button className="w-full">Crear Contrato</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <FaFileInvoice className="text-xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Generar Cotizaciones
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Crea y gestiona tus cotizaciones de manera eficiente
            </p>
            <Link href="/quotation">
              <Button className="w-full" color="success">
                Generar Cotización
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <FaMoneyCheckAlt className="text-xl text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Registra devoluciones de pago
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Organiza y genera los reportes de devolución de pago junto con sus
              descuentos
            </p>
            <Link href="/paybackInformation">
              <Button className="w-full" color="purple">
                Gestionar Devoluciones
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Reciente
          </h3>
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay actividad reciente para mostrar.
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Comienza creando tu primer contrato o subiendo facturas.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
