// 1. Configuración de la URL Base:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'; 

// --- 2. Tipos de Datos (Interfaces) ---

/** Estructura de un usuario individual devuelto por el detalle o la lista. */
export interface UserData {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
  birthdate: string | null;
  url_image: string | null;
  created_at: string;
  updated_at: string;
}

/** Estructura de la respuesta paginada de la API. */
export interface PaginatedUsersResponse {
  data: UserData[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Función genérica para manejar errores comunes de la API.
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMsg = `Error HTTP ${response.status} al comunicarse con la API.`;
  
  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMsg = Array.isArray(errorData.message) 
        ? errorData.message.join(', ')
        : errorData.message;
    }
  } catch (e) {
    // No se pudo parsear el JSON de error
  }
  
  throw new Error(errorMsg);
}

/**
 * 🔒 Servicio Protegido de Lista Paginada: GET /users
 * @param token - El token JWT requerido en el header 'Authorization'.
 * @param page - Número de página.
 * @param limit - Elementos por página.
 * @returns Promesa que resuelve a PaginatedUsersResponse.
 */
export async function getPaginatedUsers(
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedUsersResponse> {
  if (!token) {
    throw new Error('Token de autorización no proporcionado.');
  }

  // 💡 Construye la URL con Query Parameters
  const url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // CLAVE DE SEGURIDAD: Envío del token en el header Authorization
      'Authorization': `Bearer ${token}`, 
    },
    // cache: 'no-store', // Recomendado si los datos cambian con frecuencia
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json() as Promise<PaginatedUsersResponse>;
}

/**
 * 🔒 Servicio Protegido de Detalle de Usuario: GET /users/:id
 * @param token - El token JWT requerido en el header 'Authorization'.
 * @param userId - El ID del usuario a consultar.
 * @returns Promesa que resuelve a UserData.
 */
export async function getUserDetail(
  token: string,
  userId: number
): Promise<UserData> {
  if (!token) {
    throw new Error('Token de autorización no proporcionado.');
  }
  
  // 💡 URL con el ID en la ruta
  const url = `${API_BASE_URL}/users/${userId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // CLAVE DE SEGURIDAD: Envío del token en el header Authorization
      'Authorization': `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json() as Promise<UserData>;
}