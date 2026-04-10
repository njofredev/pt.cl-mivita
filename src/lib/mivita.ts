export type MiVitaStatus = 'VIGENTE' | 'NO_VIGENTE' | 'UNKNOWN' | 'ERROR';

export interface ValidationResponse {
  success: boolean;
  estado?: string;
  error?: string;
}

const API_URL = "https://m30gs3t5a0.execute-api.us-west-2.amazonaws.com/wsmivita/prod/validar";
const API_KEY = process.env.MI_VITA_API_KEY;
const SECRET = process.env.MI_VITA_SECRET;

export const validateRutMiVita = async (rut: string): Promise<ValidationResponse> => {
  const url = new URL(API_URL);
  url.searchParams.append('apikey', API_KEY || '');
  url.searchParams.append('secret', SECRET || '');
  url.searchParams.append('rut', rut);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // The API sometimes returns 200 OK even for "VECINO_NO_EXISTE"
      if (data.status?.message === 'VECINO_NO_EXISTE') {
        return { success: false, error: 'VECINO_NO_EXISTE' };
      }

      return {
        success: !!data.status?.estado,
        estado: data.status?.estado || 'UNKNOWN',
        error: !data.status?.estado ? (data.status?.message || 'UNKNOWN_STATUS') : undefined
      };
    } else if (response.status === 400) {
      return { success: false, error: 'INVALID_PARAMETERS' };
    } else if (response.status === 401) {
      try {
        const data = await response.json();
        return { success: false, error: data.status?.message || 'UNAUTHORIZED' };
      } catch {
        return { success: false, error: 'UNAUTHORIZED' };
      }
    } else {
      return { success: false, error: `HTTP_ERROR_${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'CONNECTION_ERROR' };
  }
};
