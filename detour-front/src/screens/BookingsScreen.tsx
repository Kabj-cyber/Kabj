import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Booking } from "../types";

function callGuide(phoneNumber: string) {
  Linking.openURL(`tel:${phoneNumber.replace(/\s/g, "")}`);
}

function openMeetupLocation(booking: Booking) {
  const { latitude, longitude, title } = booking.attraction;
  const label = encodeURIComponent(title);
  const url =
    Platform.OS === "ios"
      ? `maps:0,0?q=${label}@${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  });
}

export default function BookingsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    api
      .getUserBookings(user.id)
      .then(setBookings)
      .catch((e) => setError(e.message || "Could not load bookings."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRetryPayment = async (booking: Booking) => {
    if (!user) return;
    setPayingId(booking.id);
    try {
      const payment = await api.initiatePayment({
        bookingId: booking.id,
        method: "MTN_MOMO",
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
      navigation.navigate("Payment", {
        paymentId: payment.id,
        attractionTitle: booking.attraction?.title || "Tour booking",
      });
    } catch (e: any) {
      Alert.alert("Payment failed", e.message || "Could not start payment.");
    } finally {
      setPayingId(null);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyText}>Log in to see your bookings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>You haven't booked any tours yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.thumb}>
                  <Ionicons name="image-outline" size={22} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.title}>{item.attraction?.title}</Text>
                  <Text style={styles.sub}>
                    {new Date(item.bookingDate).toLocaleDateString()} ·{" "}
                    {new Date(item.bookingDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.amount}>GHS {Number(item.totalAmount).toFixed(2)}</Text>
                  {item.paymentStatus !== "PAID" ? (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => handleRetryPayment(item)}
                      disabled={payingId === item.id}
                    >
                      {payingId === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="wallet-outline" size={14} color="#fff" />
                          <Text style={styles.payBtnText}>Pay Now</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.qrBtn}
                      onPress={() =>
                        navigation.navigate("BookingQr", {
                          bookingId: item.id,
                          attractionTitle: item.attraction?.title || "Tour booking",
                          bookingDate: item.bookingDate,
                          totalAmount: item.totalAmount,
                        })
                      }
                    >
                      <Ionicons name="qr-code-outline" size={14} color="#fff" />
                      <Text style={styles.payBtnText}>Show QR</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  style={[
                    styles.statusPill,
                    item.paymentStatus === "PAID" ? styles.statusPaid : styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusText}>{item.paymentStatus}</Text>
                </View>
              </View>

              <View style={styles.meetingBlock}>
                {item.guide ? (
                  <>
                    <View style={styles.meetingRow}>
                      <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                      <Text style={styles.meetingText}>
                        Your guide: <Text style={styles.meetingBold}>{item.guide.name}</Text>
                      </Text>
                    </View>
                    {item.guide.phoneNumber ? (
                      <TouchableOpacity
                        style={styles.meetingRow}
                        onPress={() => callGuide(item.guide!.phoneNumber!)}
                      >
                        <Ionicons name="call-outline" size={16} color={colors.primary} />
                        <Text style={[styles.meetingText, styles.meetingLink]}>
                          {item.guide.phoneNumber}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.meetingRow}>
                    <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.meetingText}>Matching you with a guide…</Text>
                  </View>
                )}
                {item.attraction ? (
                  <TouchableOpacity style={styles.meetingRow} onPress={() => openMeetupLocation(item)}>
                    <Ionicons name="location-outline" size={16} color={colors.primary} />
                    <Text style={[styles.meetingText, styles.meetingLink]} numberOfLines={1}>
                      {item.attraction.title} · {item.attraction.region}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  header: { fontSize: 20, fontWeight: "800", color: colors.text, paddingHorizontal: 20, marginBottom: 14 },
  list: { padding: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  meetingBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  meetingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  meetingText: { fontSize: 12.5, color: colors.text, flexShrink: 1 },
  meetingBold: { fontWeight: "700" },
  meetingLink: { color: colors.primary, fontWeight: "600" },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: "#eceae3",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "700", fontSize: 14, color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 4 },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 8,
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryDark,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 8,
  },
  payBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  statusPaid: { backgroundColor: "#dcfce7" },
  statusPending: { backgroundColor: "#fef3c7" },
  statusText: { fontSize: 11, fontWeight: "700", color: colors.text },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  errorText: { textAlign: "center", color: colors.danger, marginTop: 40, paddingHorizontal: 20 },
});
