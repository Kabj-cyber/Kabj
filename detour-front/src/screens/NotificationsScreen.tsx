import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { AppNotification } from "../types";

type Tone = "success" | "danger" | "warning" | "info";

function toneForType(type: string): Tone {
  const t = type.toUpperCase();
  if (t.includes("FAIL") || t.includes("REJECT")) return "danger";
  if (t.includes("SUCCESS") || t.includes("APPROV")) return "success";
  if (t.includes("INCIDENT") || t.includes("SAFETY") || t.includes("SOS")) return "warning";
  return "info";
}

const TONE_STYLES: Record<Tone, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: colors.success, icon: "checkmark-circle" },
  danger: { bg: colors.danger, icon: "alert-circle" },
  warning: { bg: colors.warning, icon: "shield-outline" },
  info: { bg: colors.primary, icon: "notifications" },
};

function formatTimestamp(createdAt?: string) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { refresh: refreshBanner } = useNotifications();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    api
      .getNotifications(user.id)
      .then((list) =>
        setNotifications(
          [...list].sort((a, b) => {
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
            return bTime - aTime;
          })
        )
      )
      .catch((e) => setError(e.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = (notification: AppNotification) => {
    if (notification.isRead) return;

    // Optimistically mark as read locally, then sync with the backend.
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
    api
      .markNotificationRead(notification.id)
      .catch(() => load())
      .finally(() => refreshBanner());
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyText}>Log in to see your notifications.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>You're all caught up — no notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const tone = TONE_STYLES[toneForType(item.type)];
            return (
              <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => handlePress(item)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconCircle, { backgroundColor: tone.bg }]}>
                  <Ionicons name={tone.icon} size={18} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.message}>{item.message}</Text>
                  {item.createdAt ? (
                    <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  header: { fontSize: 20, fontWeight: "800", color: colors.text },
  list: { padding: 20, paddingTop: 0 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: "#f2f7f4",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontWeight: "700", fontSize: 14, color: colors.text, flexShrink: 1 },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 6,
  },
  message: { fontSize: 13, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  timestamp: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: "center", paddingHorizontal: 30 },
  errorText: { textAlign: "center", color: colors.danger, marginTop: 40, paddingHorizontal: 20 },
});
