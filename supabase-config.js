/*
 * Điền hai giá trị lấy từ Supabase Dashboard > Project Settings > API.
 * Chỉ dùng anon/public key ở frontend, tuyệt đối không đưa service_role key vào đây.
 */
window.VCT_SUPABASE_URL = "https://wdyymeclqwxvjvhkcwpi.supabase.co";
window.VCT_SUPABASE_ANON_KEY = "sb_publishable_hkyis_DVUOFXaH9a-Dbo_w_jha0Ilok";
window.vctSupabase = null;
window.VCT_SUPABASE_CONFIGURED = Boolean(
  window.VCT_SUPABASE_URL && window.VCT_SUPABASE_ANON_KEY && window.supabase,
);
if (window.VCT_SUPABASE_CONFIGURED) {
  window.vctSupabase = window.supabase.createClient(
    window.VCT_SUPABASE_URL,
    window.VCT_SUPABASE_ANON_KEY,
  );
}
