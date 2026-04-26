import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatThread } from '@/components/chat/chat-thread';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ChatRoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/chat/${room}`);

  const { data: roomRow } = await supabase
    .from('chat_rooms')
    .select('*, boats(id,title,cover_image_url,price)')
    .eq('id', room)
    .single();
  if (!roomRow) notFound();

  if (![roomRow.buyer_id, roomRow.seller_id].includes(user.id)) {
    return notFound();
  }

  const isBuyer = roomRow.buyer_id === user.id;
  const myHandle = isBuyer ? roomRow.buyer_handle : roomRow.seller_handle;
  const otherHandle = isBuyer ? roomRow.seller_handle : roomRow.buyer_handle;

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id,sender_id,body,is_system,created_at')
    .eq('room_id', room)
    .order('created_at', { ascending: true })
    .limit(200);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 商品ヘッダー */}
      {roomRow.boats && (
        <Link
          href={`/boats/${roomRow.boats.id}`}
          className="card-soft p-3 flex items-center gap-3 mb-4"
        >
          {roomRow.boats.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={roomRow.boats.cover_image_url} alt="" className="w-16 h-12 rounded object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ocean-900 truncate">{roomRow.boats.title}</p>
            <p className="text-xs text-coral-500">¥{roomRow.boats.price?.toLocaleString()}</p>
          </div>
        </Link>
      )}

      <div className="card-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-ocean-100 bg-ocean-50/40">
          <p className="text-xs text-ocean-700">
            匿名チャット（あなたは「{myHandle}」、相手は「{otherHandle}」と表示されます）
          </p>
        </div>
        <ChatThread
          roomId={room}
          myUserId={user.id}
          myHandle={myHandle ?? 'あなた'}
          otherHandle={otherHandle ?? '相手'}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  );
}
