import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const STORE_ID = (import.meta as any).env.VITE_STORE_ID || 'caldo74';
export const VAPID_PUBLIC_KEY = 'BA44TIkiTnx7pF8kOel6-uBqLahhc85LhPqIuMIOtrQ7TfaYVcNEkU5Pq2uyMeuJoF0iFHVxVcqk6HX4OTowT2c';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushSubscription() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();

        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }

        const subJson = sub.toJSON();
        const id = btoa(sub.endpoint).slice(-20);

        await supabase.from('push_subscriptions').upsert({
          id,
          store_id: STORE_ID,
          endpoint: sub.endpoint,
          subscription: subJson
        }, { onConflict: 'endpoint' });
      } catch (e) {
        console.log('[Push] Subscription failed or denied:', e);
      }
    };

    // Pequeno delay para não bloquear o carregamento
    setTimeout(register, 3000);
  }, []);
}
