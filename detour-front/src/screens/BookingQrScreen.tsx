import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { api } from "../api/client";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "BookingQr">;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function friendlyQrError(message: string): { blocking: boolean; text: string } {
  const lower = message.toLowerCase();
  if (lower.includes("expired")) {
    return { blocking: false, text: message };
  }
  if (lower.includes("paid") || lower.includes("payment")) {
    return {
      blocking: true,
      text: "This booking isn’t paid yet. Complete payment to get your check-in QR code.",
    };
  }
  if (lower.includes("pending_execution") || lower.includes("execution status")) {
    return {
      blocking: true,
      text: "This booking can’t be checked in right now. It may already be completed.",
    };
  }
  if (lower.includes("authorized")) {
    return {
      blocking: true,
      text: "You don’t have access to this booking’s QR code.",
    };
  }
  return { blocking: true, text: message || "Could not load QR code." };
}

export default function BookingQrScreen({ route, navigation }: Props) {
  const { bookingId, attractionTitle, bookingDate, totalAmount } = route.params;
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [blockingMessage, setBlockingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchGen = useRef(0);

  const fetchToken = useCallback(async () => {
    if (!user) {
      setBlockingMessage("Log in to view your booking QR code.");
      setLoading(false);
      return;
    }

    const gen = ++fetchGen.current;
    setLoading(true);
    setError(null);
    setBlockingMessage(null);

    try {
      const res = await api.getBookingQrToken(bookingId, user.id);
      if (gen !== fetchGen.current) return;
      setToken(res.token);
      setSecondsLeft(res.expiresInSeconds);
    } catch (e: any) {
      if (gen !== fetchGen.current) return;
      const message = e?.message || "Could not load QR code.";
      if (/expired/i.test(message)) {
        // Token endpoint rarely returns this; re-fetch once for a fresh code.
        setToken(null);
        setSecondsLeft(0);
        try {
          const res = await api.getBookingQrToken(bookingId, user.id);
          if (gen !== fetchGen.current) return;
          setToken(res.token);
          setSecondsLeft(res.expiresInSeconds);
          return;
        } catch (retryErr: any) {
          if (gen !== fetchGen.current) return;
          const retryMsg = retryErr?.message || message;
          const friendly = friendlyQrError(retryMsg);
          if (friendly.blocking) {
            setBlockingMessage(friendly.text);
          } else {
            setError(friendly.text);
          }
          setToken(null);
          return;
        }
      }
      const friendly = friendlyQrError(message);
      setToken(null);
      setSecondsLeft(0);
      if (friendly.blocking) {
        setBlockingMessage(friendly.text);
      } else {
        setError(friendly.text);
      }
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  }, [bookingId, user]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (!token || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [token]);

  const expired = !!token && secondsLeft <= 0;
  const showQr = !!token && !expired && !blockingMessage;

  const bookingDateLabel = (() => {
    try {
      const d = new Date(bookingDate);
      return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return bookingDate;
    }
  })();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Check-in QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summary}>
        <Text style={styles.title}>{attractionTitle}</Text>
        <Text style={styles.sub}>{bookingDateLabel}</Text>
        <Text style={styles.amount}>GHS {Number(totalAmount).toFixed(2)}</Text>
      </View>

      <View style={styles.qrArea}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : blockingMessage ? (
          <View style={styles.messageBox}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.warning} />
            <Text style={styles.messageText}>{blockingMessage}</Text>
            <Button title="Go back" variant="outline" onPress={() => navigation.goBack()} />
          </View>
        ) : showQr ? (
          <>
            <View style={styles.qrFrame}>
              <QRCode value={token!} size={240} />
            </View>
            <Text style={styles.countdownLabel}>Code expires in</Text>
            <Text style={styles.countdown}>{formatCountdown(secondsLeft)}</Text>
            <Text style={styles.hint}>Show this code to your guide at check-in.</Text>
          </>
        ) : (
          <View style={styles.messageBox}>
            <Ionicons name="time-outline" size={40} color={colors.textMuted} />
            <Text style={styles.messageText}>
              {error || (expired ? "This QR code has expired." : "QR code unavailable.")}
            </Text>
            <Button title="Refresh code" onPress={fetchToken} loading={loading} />
          </View>
        )}
      </View>

      {showQr ? (
        <Button
          title="Refresh code"
          variant="outline"
          onPress={fetchToken}
          style={styles.refreshBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: { fontSize: 18, fontWeight: "800", color: colors.text },
  summary: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  amount: { fontSize: 15, fontWeight: "700", color: colors.primary, marginTop: 8 },
  qrArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  qrFrame: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countdownLabel: { marginTop: 20, fontSize: 13, color: colors.textMuted },
  countdown: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  messageBox: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  refreshBtn: { marginHorizontal: 20, marginBottom: 32 },
});
