import { supabase } from "@/lib/supabase";

export async function pingKeepalive(): Promise<void> {
  try {
    await supabase.rpc('keepalive_ping');
  } catch (e) {
    console.warn('Keepalive ping failed', e);
  }
}

