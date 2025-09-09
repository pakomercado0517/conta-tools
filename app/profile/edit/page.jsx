"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Button, TextInput, Label, Alert, Spinner } from "flowbite-react";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaShieldAlt,
  FaEdit,
} from "react-icons/fa";
import Link from "next/link";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Estados para el perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Estado para carga inicial
  const [initialLoading, setInitialLoading] = useState(true);

  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState("profile");

  // Estados para reenvío de verificación
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ type: "", text: "" });

  // Cargar datos del perfil al montar
  useEffect(() => {
    if (status === "loading") return; // Aún cargando la sesión

    if (!session) {
      router.push("/auth/login");
      return;
    }

    loadProfile();
  }, [session, status, router]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      } else {
        console.error("Error loading profile");
        setProfileMessage({ type: "error", text: "Error cargando el perfil" });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfileMessage({ type: "error", text: "Error cargando el perfil" });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        // Si se cambió el email, cerrar sesión automáticamente
        if (data.emailChanged || data.shouldSignOut) {
          setProfileMessage({
            type: "warning",
            text: data.message,
          });

          // Dar tiempo al usuario para leer el mensaje antes de cerrar sesión
          setTimeout(async () => {
            console.log("📧 Email changed, signing out user for security...");
            await signOut({
              redirect: true,
              callbackUrl: "/auth/login?message=email-changed",
            });
          }, 3000); // 3 segundos de delay

          return; // No continuar con otras actualizaciones
        }

        // Para cambios que no involucran email
        setProfileMessage({ 
          type: 'success', 
          text: data.message + ' La información se ha actualizado correctamente.' 
        });
        
        // Actualizar inmediatamente el estado local con los nuevos datos
        setProfileData({
          name: data.user.name,
          email: data.user.email
        });
        
        // Mostrar indicador de actualización
        setProfileUpdating(true);
        
        try {
          // Actualizar la sesión con la nueva información
          console.log('🔄 Updating NextAuth session with new data...');
          const updateResult = await update({
            ...session,
            user: {
              ...session.user,
              name: data.user.name,
              email: data.user.email,
              emailVerified: data.user.emailVerified
            }
          });
          console.log('✅ Session updated:', updateResult);
          
          // Esperar un poco para que la sesión se propague
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Refrescar la página para obtener los datos actualizados del servidor
          console.log('🔄 Refreshing router...');
          router.refresh();
          
          console.log('✨ Profile data refreshed successfully');
        } catch (refreshError) {
          console.error('Error refreshing profile data:', refreshError);
        } finally {
          // Pequeño delay antes de quitar el indicador de actualización
          setTimeout(() => {
            setProfileUpdating(false);
          }, 500);
        }
      } else {
        setProfileMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileMessage({
        type: "error",
        text: "Error actualizando el perfil",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    // Validación del lado del cliente
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "La nueva contraseña y la confirmación no coinciden",
      });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "La nueva contraseña debe tener al menos 6 caracteres",
      });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: "success", text: data.message });
        // Limpiar formulario
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Reset password visibility
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });
      } else {
        setPasswordMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordMessage({
        type: "error",
        text: "Error cambiando la contraseña",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage({ type: "success", text: data.message });
      } else {
        setResendMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage({
        type: "error",
        text: "Error enviando el email de verificación",
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Mostrar loading mientras carga la sesión o los datos
  if (status === "loading" || initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          <FaArrowLeft className="mr-2" />
          Volver al Dashboard
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <FaUser className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                {profileData.name || session.user?.name}
                {profileUpdating && (
                  <div className="ml-2 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="ml-1 text-sm text-blue-600 dark:text-blue-400">Actualizando...</span>
                  </div>
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{profileData.email || session.user?.email}</p>
              <div className="mt-2">
                {session.user?.emailVerified ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    <FaCheck className="mr-1 h-3 w-3" />
                    Email verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FaExclamationTriangle className="mr-1 h-3 w-3" />
                    Email sin verificar
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs con formularios */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <FaEdit className="mr-2 inline" />
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <FaShieldAlt className="mr-2 inline" />
              Seguridad
            </button>
            {!session?.user?.emailVerified && (
              <button
                onClick={() => setActiveTab("verification")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "verification"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <FaEnvelope className="mr-2 inline" />
                Verificación
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "profile" && (
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <div className="mb-4 flex items-center">
                <FaEdit className="mr-2 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información Personal
                </h3>
              </div>

              {profileMessage.text && (
                <Alert
                  color={
                    profileMessage.type === "success"
                      ? "success"
                      : profileMessage.type === "warning"
                        ? "warning"
                        : "failure"
                  }
                  icon={
                    profileMessage.type === "success"
                      ? FaCheck
                      : FaExclamationTriangle
                  }
                  className="mb-4"
                >
                  {profileMessage.text}
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" value="Nombre completo" />
                  <TextInput
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Tu nombre completo"
                    required
                    icon={FaUser}
                  />
                </div>

                <div>
                  <Label htmlFor="email" value="Dirección de email" />
                  <TextInput
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="tu@email.com"
                    required
                    icon={FaEnvelope}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Si cambias tu email, deberás verificarlo nuevamente.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={profileLoading} className="w-full">
              {profileLoading ? (
                <>
                  <Spinner size="sm" light className="mr-2" />
                  Actualizando...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Actualizar Información
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Tab: Cambiar Contraseña */}
      {activeTab === "security" && (
        <Card>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <div className="mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cambiar Contraseña
                </h3>
              </div>

              {passwordMessage.text && (
                <Alert
                  color={
                    passwordMessage.type === "success" ? "success" : "failure"
                  }
                  icon={
                    passwordMessage.type === "success"
                      ? FaCheck
                      : FaExclamationTriangle
                  }
                  className="mb-4"
                >
                  {passwordMessage.text}
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" value="Contraseña actual" />
                  <div className="relative">
                    <TextInput
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Tu contraseña actual"
                      required
                      icon={FaKey}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.current ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" value="Nueva contraseña" />
                  <div className="relative">
                    <TextInput
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Nueva contraseña (mínimo 6 caracteres)"
                      required
                      minLength="6"
                      icon={FaKey}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.new ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    value="Confirmar nueva contraseña"
                  />
                  <div className="relative">
                    <TextInput
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirma tu nueva contraseña"
                      required
                      icon={FaKey}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.confirm ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <div className="flex">
                  <FaExclamationTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Consejos de seguridad:
                    </h4>
                    <ul className="mt-2 list-inside list-disc text-sm text-yellow-700 dark:text-yellow-300">
                      <li>
                        Usa una contraseña fuerte con al menos 8 caracteres
                      </li>
                      <li>Incluye letras mayúsculas, minúsculas y números</li>
                      <li>Evita usar información personal fácil de adivinar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full"
              color="failure"
            >
              {passwordLoading ? (
                <>
                  <Spinner size="sm" light className="mr-2" />
                  Cambiando...
                </>
              ) : (
                <>
                  <FaShieldAlt className="mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Pestaña: Verificación de Email */}
      {activeTab === "verification" && !session?.user?.emailVerified && (
        <Card>
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Verificación de Email
                </h3>
              </div>

              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                <div className="flex items-start">
                  <FaExclamationTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Tu email no está verificado
                    </h4>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Para acceder a todas las funcionalidades de Conta Tools,
                        necesitas verificar tu dirección de email.
                      </p>
                      <p className="mt-1">
                        <strong>Email actual:</strong> {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {resendMessage.text && (
                <Alert
                  color={
                    resendMessage.type === "success" ? "success" : "failure"
                  }
                  icon={
                    resendMessage.type === "success"
                      ? FaCheck
                      : FaExclamationTriangle
                  }
                  className="mb-4"
                >
                  {resendMessage.text}
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    ¿No recibiste el email de verificación?
                  </h4>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Puedes solicitar que te enviemos un nuevo email de
                    verificación. Revisa también tu carpeta de spam.
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    color="warning"
                    className="w-full sm:w-auto"
                  >
                    {resendLoading ? (
                      <>
                        <Spinner size="sm" light className="mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" />
                        Reenviar Email de Verificación
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Instrucciones:
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      Haz clic en &quot;Reenviar Email de Verificación&quot;
                    </li>
                    <li>Revisa tu bandeja de entrada y carpeta de spam</li>
                    <li>
                      Haz clic en el enlace del email para verificar tu cuenta
                    </li>
                    <li>
                      Una vez verificado, podrás acceder a todas las
                      funcionalidades
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                  <div className="flex items-start">
                    <FaCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        ¿Por qué verificar tu email?
                      </h4>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ul className="list-inside list-disc space-y-1">
                          <li>Acceso completo a todas las herramientas</li>
                          <li>Seguridad adicional para tu cuenta</li>
                          <li>Notificaciones importantes por email</li>
                          <li>Recuperación de contraseña si la olvidas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Información adicional */}
      <div className="mt-8 text-center">
        <Card>
          <div className="flex items-center justify-center">
            <FaShieldAlt className="mr-2 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">
                  Seguridad:
                </strong>{" "}
                Los cambios en tu perfil se guardan inmediatamente. Si cambias
                tu email, recibirás un correo de verificación en tu nueva
                dirección.
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                Tu contraseña está encriptada y nunca se almacena en texto
                plano.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
