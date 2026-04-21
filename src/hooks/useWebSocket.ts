import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { Paths } from "../utils/api/factory";
import { useUserContext } from "./../context/User.context";

type SocketEventListener = {
  event: string;
  invalidateKeys: string[];
};

const socketEventListeners: SocketEventListener[] = [];

const SOCKET_URL = import.meta.env.VITE_API_URL;

export function useWebSocket(shouldConnect = false) {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  // Store socket in ref - only create/destroy on mount/unmount
  const socketRef = useRef<Socket | null>(null);
  // Track disconnection time
  const disconnectTimeRef = useRef<number | null>(null);

  // Store current values in refs (to solve closure issues)
  const latestValuesRef = useRef({
    queryClient,
    user,
  });

  // Update refs
  useEffect(() => {
    latestValuesRef.current = {
      queryClient,
      user,
    };
  }, [queryClient, user]);

  // Create socket connection only once
  useEffect(() => {
    // Don't connect if user is not authenticated
    if (!shouldConnect) {
      return;
    }

    // If socket already exists, don't recreate it
    if (socketRef.current) {
      return;
    }

    const socket: Socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ WebSocket connection established.");
      disconnectTimeRef.current = null;
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket connection lost:", reason);
      disconnectTimeRef.current = Date.now();

      if (reason === "io server disconnect") {
        // Disconnected by server, manually reconnect
        socket.connect();
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      const { queryClient } = latestValuesRef.current;
      const disconnectDuration = disconnectTimeRef.current
        ? Date.now() - disconnectTimeRef.current
        : 0;

      console.log(
        `🔄 WebSocket reconnected (attempt: ${attemptNumber}, disconnect duration: ${Math.round(
          disconnectDuration / 1000,
        )}s)`,
      );

      if (disconnectDuration > 30000) {
        // If connection was lost for more than 30 seconds, invalidate all queries
        console.log(
          "⚠️ Connection was lost for a long time, refetching all active queries...",
        );
        queryClient.invalidateQueries();
      } else {
        // TODO: this will be updated
        const criticalQueries = [
          [`${Paths.Notification}/new`],
          [`${Paths.Notification}/all`],
          [`${Paths.Accounting}/stocks`],
          [`${Paths.Accounting}/stocks/query`],
        ];

        criticalQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt: ${attemptNumber}`);
    });

    socket.on("reconnect_error", (error: Error) => {
      console.warn("⚠️ WebSocket reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error(
        "❌ WebSocket reconnection failed. Please try reconnecting manually.",
      );
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
    });

    socketEventListeners.forEach((eventConfig) => {
      socket.on(eventConfig.event, () => {
        const { queryClient } = latestValuesRef.current;
        eventConfig.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key], exact: false });
        });
      });
    });

    // Cleanup: only close socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [shouldConnect]); // Connect when user is authenticated
}
