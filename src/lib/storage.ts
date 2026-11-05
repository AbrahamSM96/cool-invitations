import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

/**
 * File storage on Cloudflare R2 (S3 API). Objects are public through
 * `R2_PUBLIC_URL` (a custom domain or the bucket's r2.dev URL).
 */

interface StorageConfig {
  bucket: string
  publicUrl: string
  client: S3Client
}

let config: StorageConfig | undefined

/** Reads the R2 settings once; throws a clear error when one is missing. */
function getConfig(): StorageConfig {
  if (config) return config

  const env = {
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  }
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`Missing storage env vars: ${missing.join(', ')}`)
  }

  config = {
    bucket: env.R2_BUCKET ?? '',
    client: new S3Client({
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? '',
      },
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
    }),
    publicUrl: (env.R2_PUBLIC_URL ?? '').replace(/\/+$/, ''),
  }
  return config
}

/** Tells whether the storage env vars are set, to show a friendly error. */
export function isStorageConfigured(): boolean {
  try {
    getConfig()
    return true
  } catch {
    return false
  }
}

/**
 * Uploads a file and returns its public URL. Keys are never reused, so the
 * file is cached forever by browsers and CDNs.
 *
 * @param key - Object path, e.g. `events/{id}/{random}.webp`.
 * @param body - File bytes.
 * @param contentType - MIME type served with the file.
 */
export async function putPublicObject(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  const { bucket, client, publicUrl } = getConfig()
  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: bucket,
      CacheControl: 'public, max-age=31536000, immutable',
      ContentType: contentType,
      Key: key,
    })
  )
  return `${publicUrl}/${key}`
}
