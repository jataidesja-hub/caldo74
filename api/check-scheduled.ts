import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const STORE_ID = process.env.VITE_STORE_ID || 'caldo74';

webpush.setVapidDetails(
  'mailto:admin@caldinho74.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: any, res: any) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Buscar notificações agendadas que ainda não foram enviadas
  const now = new Date().toISOString();
  const { data: pending } = await supabase
    .from('notifications')
    .select('*')
    .eq('store_id', STORE_ID)
    .eq('status', 'pending')
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', now);

  if (!pending || pending.length === 0) return res.status(200).json({ processed: 0 });

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('store_id', STORE_ID);

  let processed = 0;
  for (const notif of pending) {
    const payload = JSON.stringify({ title: notif.title, body: notif.body, url: notif.url || '/' });
    await Promise.allSettled(
      (subscriptions || []).map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
        } catch (e: any) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notif.id);
    processed++;
  }

  return res.status(200).json({ processed });
}
