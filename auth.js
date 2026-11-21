// Servio AI site — shared sign-in client. Loaded after the supabase-js UMD bundle.
// The key below is the project's publishable (public) key: it only identifies the project.
// What a visitor may see is decided by row-level security and the site_* functions on the server.
(function () {
  const URL = "https://bvfcgrnrpjlbrzawmhqh.supabase.co";
  const KEY = "sb_publishable_EJ3NQygx8T9-4mKX00JHPQ_Yo-GZZG8";
  const sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const SITE = location.origin + location.pathname.replace(/\/demo\/.*$|\/[^/]*$/, "/");

  async function access() {
    const { data, error } = await sb.rpc("site_my_access");
    if (error) return { signed_in: false, admin: false, demo: false };
    return data;
  }
  async function gunzipB64(b64) {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"));
    return await new Response(stream).text();
  }
  async function gzipB64(text) {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  }
  window.servio = { sb, access, gunzipB64, gzipB64, SITE };
})();
