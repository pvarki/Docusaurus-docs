import { jwtVerify, createRemoteJWKSet } from "jose";

const jwks = createRemoteJWKSet(
  new URL(`${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`)
);

export default async function handler(req, res) {
  const { code, idToken } = req.body as { code?: string; idToken?: string };
  if (!code || !idToken) return res.status(400).end("Missing parameters");

  // ── verify Kinde ID-token ──
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: process.env.KINDE_ISSUER_URL,
    audience: process.env.KINDE_AUDIENCE,
  });
  if (!payload.is_tina_editor) return res.status(403).end("Forbidden");

  // ── pull helper from tinacms at runtime ──
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore: tinacms/dist/auth exists at runtime but has no type declarations
  const { createAccessToken } = await import("tinacms/dist/auth");

  const ghToken = await createAccessToken({
    code,
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  });

  res.status(200).json(ghToken);
}
