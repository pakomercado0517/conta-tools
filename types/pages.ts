// =====================================
// TIPOS PARA PÁGINAS DE NEXT.JS
// =====================================

// Tipos básicos para parámetros de página
export interface PageParams {
  [key: string]: string | string[] | undefined;
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

// Props base para todas las páginas
export interface BasePageProps {
  params: PageParams;
  searchParams: SearchParams;
}

// Props para página principal (home)
export interface HomePageProps extends BasePageProps {}

// Props para dashboard
export interface DashboardPageProps extends BasePageProps {}

// Props para páginas de autenticación
export interface AuthPageProps extends BasePageProps {
  params: PageParams;
  searchParams: {
    redirect?: string;
    error?: string;
    message?: string;
  } & SearchParams;
}

// Props para login page
export interface LoginPageProps extends AuthPageProps {}

// Props para register page
export interface RegisterPageProps extends AuthPageProps {}

// Props para reset password page
export interface ResetPasswordPageProps extends AuthPageProps {
  searchParams: {
    token?: string;
    email?: string;
  } & AuthPageProps['searchParams'];
}

// Props para verify email page
export interface VerifyEmailPageProps extends AuthPageProps {
  searchParams: {
    token?: string;
    email?: string;
  } & AuthPageProps['searchParams'];
}

// Props para generador de contratos
export interface GeneradorContratosPageProps extends BasePageProps {}

// Props para cotizaciones
export interface QuotationPageProps extends BasePageProps {}

// Props para perfil de usuario
export interface ProfilePageProps extends BasePageProps {}

// Props para edición de perfil
export interface EditProfilePageProps extends BasePageProps {}

// Props para herramientas específicas
export interface CounterMoneyPageProps extends BasePageProps {}

export interface GetCostsPageProps extends BasePageProps {}

export interface PaybackInformationPageProps extends BasePageProps {}

export interface SDICalculatorPageProps extends BasePageProps {}

export interface LicensingPageProps extends BasePageProps {}

export interface GeneradorConceptosPageProps extends BasePageProps {}

export interface DevToolsPageProps extends BasePageProps {}

// Props para páginas con parámetros dinámicos
export interface DynamicPageProps extends BasePageProps {
  params: {
    slug: string | string[];
  } & PageParams;
}

// Tipos para metadata dinámico
export interface GenerateMetadataProps {
  params: PageParams;
  searchParams: SearchParams;
}

// Tipos para formularios de autenticación
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Estados de formularios de auth
export interface AuthFormState {
  loading: boolean;
  error: string;
  isEmailNotConfirmed?: boolean;
  showPassword?: boolean;
}

// Props para páginas de error
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Props para página loading
export interface LoadingPageProps {}

// Props para página not-found
export interface NotFoundPageProps {}