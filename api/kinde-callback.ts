import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code, state } = req.query;             // state carries the “returnTo” URL
  if (!code) return res.status(400).end('Missing code');

  const tokenResp = await fetch(`${process.env.KINDE_ISSUER_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KINDE_CLIENT_ID ?? '',
      code: code?.toString() ?? '',
      redirect_uri: `${req.headers.origin}/api/kinde-callback`
    })
  }).then(r => r.json());

  // Store ID-token (signed JWT) in http-only cookie
  res.setHeader('Set-Cookie',
    serialize('kinde_id_token', tokenResp.id_token, {
      httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 60 * 60
    })
  );

  // back to originally requested page or /
  res.writeHead(302, { Location: state ?? '/' });
  res.end();
}
