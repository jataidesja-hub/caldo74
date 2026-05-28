import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const STORE_ID = process.env.VITE_STORE_ID || 'caldo74';

webpush.setVapidDetails(
  'mailto:admin@caldinho74.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, body, url = '/', notificationId } = req.body;

  if (!title || !body) return res.status(400).json({ error: 'title e body obrigatórios' });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('store_id', STORE_ID);

  if (error) return res.status(500).json({ error: error.message });

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    (subscriptions || []).map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (e: any) {
        // Remove stale subscriptions (410 Gone)
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
        throw e;
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  if (notificationId) {
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notificationId);
  }

  return res.status(200).json({ sent, failed, total: subscriptions?.length || 0 });
}
