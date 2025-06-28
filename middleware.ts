import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const config = { matcher: ['/admin/:path*'] };

const jwks = createRemoteJWKSet(
  new URL(`${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`)
);

export async function middleware(req) {
  const tok = req.cookies.get('kinde_id_token')?.value;
  if (!tok) {
    const url = `${process.env.KINDE_ISSUER_URL}/oauth2/authorize` +
      `?client_id=${process.env.KINDE_CLIENT_ID}` +
      `&response_type=code&scope=openid%20profile%20email` +
      `&redirect_uri=${encodeURIComponent(req.nextUrl.origin)}/api/kinde-callback` +
      `&state=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(tok, jwks, {
      issuer: process.env.KINDE_ISSUER_URL,
      audience: process.env.KINDE_AUDIENCE,
    });
    if (payload.is_tina_editor) return NextResponse.next();
  } catch (_) { /* fall through */ }

  return new NextResponse('Forbidden', { status: 403 });
}
