"use client";

import { useEffect, useRef } from "react";
import { getSubscriber } from "@/lib/realtime";
import type { RealtimeSubscriber } from "@/lib/realtime";

/**
 * Generic hook for subscribing to realtime events on a specific channel
 *
 * @param channel - Channel name to subscribe to
 * @param event - Event name to listen for
 * @param onMessage - Callback function when a message is received
 * @param enabled - Whether the subscription is enabled
 */
export function useRealtime<T>(
  channel: string,
  event: string,
  onMessage: (data: T) => void,
  enabled: boolean = true
) {
  const subscriberRef = useRef<RealtimeSubscriber | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update the ref when the callback changes to avoid re-subscribing
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const connect = async () => {
      try {
        const subscriber = getSubscriber();
        subscriberRef.current = subscriber;

        // Ensure we are connected
        await subscriber.connect();

        if (mounted) {
          subscriber.subscribe(channel, event, (data) => {
            if (mounted) {
              onMessageRef.current(data as T);
            }
          });
        }
      } catch (err) {
        console.error("Realtime subscription error:", err);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (subscriberRef.current) {
        // Note: RealtimeSubscriber.unsubscribe in this project currently detaches the entire channel.
        // This is safe if only one listener per channel is used at a time.
        subscriberRef.current.unsubscribe(channel);
      }
    };
  }, [channel, event, enabled]);
}
