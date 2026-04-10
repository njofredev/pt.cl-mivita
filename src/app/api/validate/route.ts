import { NextRequest, NextResponse } from 'next/server';
import { validateRutMiVita } from '../../../lib/mivita';
import { logConsultation, initDb } from '../../../lib/db';

// Ensure DB is initialized (this is a simple way for this small app)
let dbInitialized = false;

export async function POST(request: NextRequest) {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }

  try {
    const { rut } = await request.json();

    if (!rut) {
      return NextResponse.json({ success: false, error: 'RUT_REQUIRED' }, { status: 400 });
    }

    const { success, estado, error } = await validateRutMiVita(rut);

    if (success && estado) {
      // Log success
      await logConsultation(rut, estado);
      return NextResponse.json({ success: true, estado });
    } else {
      // Log error
      await logConsultation(rut, error || 'UNKNOWN_ERROR');
      return NextResponse.json({ success: false, error }, { status: error === 'VECINO_NO_EXISTE' ? 404 : 400 });
    }
  } catch (err) {
    console.error('API Route Error:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
