import { ImageResponse } from 'next/og';
import { supabase } from "@/lib/supabase";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default async function Icon() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('avatar_url, avatar_x, avatar_y, avatar_scale')
    .order('updated_at', { ascending: false })
    .limit(1);
    
  const profile = profiles?.[0];
  const avatarUrl = profile?.avatar_url;

  if (!avatarUrl) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '50%' }} />
      ),
      { ...size }
    );
  }

  const avatarX = profile.avatar_x ?? 50;
  const avatarY = profile.avatar_y ?? 50;
  const avatarScale = profile.avatar_scale ?? 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={avatarUrl}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            objectPosition: `${avatarX}% ${avatarY}%`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
