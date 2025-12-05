// src/services/auth.ts

// 1. Configuración de la URL Base:
// Utilizamos una variable de entorno de Next.js.
// Asegúrate de que 'NEXT_PUBLIC_API_BASE_URL' esté definida en tu archivo .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

// --- 2. Tipos de Datos (Interfaces) ---

/** Credenciales mínimas requeridas para Login. */
interface LoginCredentials {
  email: string;
  password: string;
}

/** Datos requeridos para Registro (incluyendo cualquier campo extra como roles_id). */
interface RegisterData extends LoginCredentials {
  roles_id: number;
  // Puedes añadir otros campos de registro aquí si son necesarios
}

/** Estructura de la respuesta exitosa del Login. */
interface LoginResponse {
  access_token: string;
  // Si el backend devuelve más datos del usuario, añádelos aquí.
}

// ----------------------------------------------------

/**
 * Función para manejar errores comunes de la API.
 * Lanza un error con el mensaje de error del servidor si está disponible.
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMsg = `Error HTTP ${response.status} al comunicarse con la API.`;
  
  try {
    const errorData = await response.json();
    // Intenta obtener un mensaje de error específico del cuerpo de la respuesta
    if (errorData && errorData.message) {
      errorMsg = errorData.message;
    } else if (errorData && typeof errorData === 'string') {
      errorMsg = errorData;
    }
  } catch (e) {
    // Si no se puede parsear JSON, usamos el mensaje HTTP por defecto.
    console.error("No se pudo parsear el cuerpo del error JSON:", e);
  }

  throw new Error(errorMsg);
}

// ----------------------------------------------------

/**
 * 🚀 Servicio de Login: POST /auth/login
 * @param data - Objeto con email y password.
 * @returns Promesa con el access_token.
 */
export async function loginUser(data: LoginCredentials): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    throw new Error("API Base URL no configurada. Por favor, revisa tu archivo .env.local.");
  }

  const url = `${API_BASE_URL}/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Envía solo los campos 'email' y 'password'
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
  
  const result = await response.json() as LoginResponse;
  localStorage.setItem('accessToken', result.access_token);

  // Devolver el cuerpo JSON (que debe contener access_token)
  return result;
}

/**
 * 📝 Servicio de Registro: POST /auth/signup
 * @param data - Objeto con email, password y roles_id.
 * @returns Promesa que indica éxito o falla.
 */
export async function registerUser(data: RegisterData): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error("API Base URL no configurada. Por favor, revisa tu archivo .env.local.");
  }

  const url = `${API_BASE_URL}/auth/signup`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Envía todos los campos requeridos para el registro
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      roles_id: data.roles_id,
      // ... otros campos si son necesarios
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  // Si el registro es exitoso (código 201), devolvemos un mensaje de éxito.
  // Podrías devolver response.json() si el backend devuelve datos de usuario.
  return "Registro de usuario exitoso.";
}
