// send-push: delivers one row of public.notifications to its user's phone.
//
// DEPLOYED to the shared project on 2026-10-12 (version 1, verify_jwt on).
// This file is the source of that deployment.
//
// Called by the database trigger on notifications (after insert) with
// { notification_id }. The function reads the notification itself, so a
// caller cannot choose the recipient or the text, and each notification is
// claimed (pushed_at) before sending, so it is pushed at most once.
//
// Needs the FIREBASE_SERVICE_ACCOUNT secret: the Firebase service-account
// JSON for the project the mobile app uses.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const base64url = (input: ArrayBuffer | string) => {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Exchanges the service account for a short-lived FCM access token.
async function getAccessToken(account: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const pem = account.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')
  const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  )
  const assertion = `${header}.${claims}.${base64url(signature)}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`)
  }
  return (await response.json()).access_token as string
}

Deno.serve(async (req) => {
  try {
    const { notification_id: notificationId } = await req.json()
    if (!notificationId) return json({ error: 'notification_id is required' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const serviceAccountText = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountText) {
      console.error('FIREBASE_SERVICE_ACCOUNT secret is not set')
      return json({ sent: false, reason: 'missing_firebase_credentials' }, 500)
    }

    // Claim the notification: only the first call for it gets a row back.
    const { data: claimed, error: claimError } = await supabase
      .from('notifications')
      .update({ pushed_at: new Date().toISOString() })
      .eq('id', notificationId)
      .is('pushed_at', null)
      .select('id, user_id, title, body, chat_id')
    if (claimError) throw claimError
    const notification = claimed?.[0]
    if (!notification) return json({ sent: false, reason: 'already_pushed_or_missing' })

    const { data: user } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('id', notification.user_id)
      .maybeSingle()
    if (!user?.fcm_token) return json({ sent: false, reason: 'no_device_token' })

    const serviceAccount = JSON.parse(serviceAccountText)
    const accessToken = await getAccessToken(serviceAccount)

    const data: Record<string, string> = { notification_id: String(notification.id) }
    if (notification.chat_id) {
      data.route = '/chat'
      data.chat_id = String(notification.chat_id)
    }

    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: user.fcm_token,
            notification: {
              title: notification.title ?? 'NoBrokerage',
              body: (notification.body ?? '').slice(0, 240),
            },
            data,
            android: { priority: 'HIGH' },
            apns: { payload: { aps: { sound: 'default' } } },
          },
        }),
      },
    )

    if (!fcmResponse.ok) {
      const detail = await fcmResponse.text()
      console.error('FCM error', fcmResponse.status, detail)
      // The device token is no longer valid: stop sending to it.
      if (fcmResponse.status === 404 || detail.includes('UNREGISTERED')) {
        await supabase.from('users').update({ fcm_token: null }).eq('id', notification.user_id)
        return json({ sent: false, reason: 'device_token_expired' })
      }
      return json({ sent: false, reason: 'fcm_error', status: fcmResponse.status }, 502)
    }

    return json({ sent: true })
  } catch (error) {
    console.error('send-push error', error)
    return json({ sent: false, reason: 'error', message: String(error) }, 500)
  }
})
