"use client";

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  email: string | null | undefined;
}

export function InviteListener({ email }: Props) {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
    }
  }, []);

  useEffect(() => {
    if (!email) return;

    // Initialize Pusher only once
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = `user-${email.replace(/[@.]/g, '-')}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new_invite', (data: { workspaceName: string, inviterName: string }) => {
      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Audio play blocked", e));
      }

      // Show toast
      toast.success(
        `You have a new invite to ${data.workspaceName} from ${data.inviterName}!`,
        { duration: 5000 }
      );

      // Refresh invites list
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [email, queryClient]);

  return null;
}
