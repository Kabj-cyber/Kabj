import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api/client";
import Button from "../components/Button";
import { useNotifications } from "../context/NotificationContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Payment, PaymentMethodType } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Payment">;

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  MTN_MOMO: "MTN Mobile Money",
  VODAFONE_CASH: "Vodafone Cash",
  CARD: "Debit / Credit Card",
};

const METHOD_ICONS: Record<PaymentMethodType, keyof typeof Ionicons.glyphMap> = {
  MTN_MOMO: "phone-portrait-outline",
  VODAFONE_CASH: "phone-portrait-outline",
  CARD: "card-outline",
};

export default function PaymentScreen({ route, navigation }: Props) {
  const { paymentId, attractionTitle } = route.params;
  const { refresh: refreshNotifications } = useNotifications();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const updated = await api.getPaymentStatus(paymentId);
      setPayment(updated);
      return updated;
    } catch (e: any) {
      Alert.alert("Payment error", e.message || "Could not check payment status.");
      return null;
    }
  }, [paymentId]);

  useEffect(() => {
    api
      .getPayment(paymentId)
      .then(setPayment)
      .catch((e) => Alert.alert("Payment error", e.message))
      .finally(() => setLoading(false));
  }, [paymentId]);

  useEffect(() => {
    if (!payment || payment.status === "SUCCESS" || payment.status === "FAILED") {
      return;
    }

    pollRef.current = setInterval(async () => {
      const updated = await refresh();
      if (updated?.status === "SUCCESS") {
        clearInterval(pollRef.current!);
        refreshNotifications();
        Alert.alert("Payment successful", "Your booking is confirmed and paid.", [
          { text: "View Bookings", onPress: () => navigation.navigate("MainTabs") },
        ]);
      } else if (updated?.status === "FAILED") {
        clearInterval(pollRef.current!);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [payment?.status, paymentId, navigation, refresh]);

  const handleOpenCheckout = () => {
    if (payment?.authorizationUrl) {
      Linking.openURL(payment.authorizationUrl);
    }
  };

  const handleSandboxConfirm = async () => {
    setConfirming(true);
    try {
      const updated = await api.confirmSandboxPayment(paymentId);
      setPayment(updated);
      refreshNotifications();
      Alert.alert("Payment successful", "Your booking is confirmed and paid.", [
        { text: "View Bookings", onPress: () => navigation.navigate("MainTabs") },
      ]);
    } catch (e: any) {
      Alert.alert("Confirmation failed", e.message);
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !payment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing payment...</Text>
      </View>
    );
  }

  const isMobileMoney =
    payment.provider === "MTN_MOMO" || payment.provider === "VODAFONE_CASH";
  const isComplete = payment.status === "SUCCESS";
  const isFailed = payment.status === "FAILED";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={isComplete ? "checkmark-circle" : isFailed ? "close-circle" : "time-outline"}
          size={48}
          color={isComplete ? colors.success : isFailed ? colors.danger : colors.warning}
        />
        <Text style={styles.title}>
          {isComplete ? "Payment Complete" : isFailed ? "Payment Failed" : "Awaiting Payment"}
        </Text>
        <Text style={styles.subtitle}>{attractionTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Row label="Method" value={METHOD_LABELS[payment.provider]} />
          <Row label="Amount" value={`${payment.currency} ${Number(payment.amount).toFixed(2)}`} />
          {payment.phoneNumber ? <Row label="Phone" value={payment.phoneNumber} /> : null}
          <Row label="Status" value={payment.status} highlight />
        </View>

        {payment.message ? (
          <View style={styles.messageBox}>
            <Ionicons name={METHOD_ICONS[payment.provider]} size={20} color={colors.primary} />
            <Text style={styles.messageText}>{payment.message}</Text>
          </View>
        ) : null}

        {isMobileMoney && !isComplete && !isFailed ? (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>What to do next</Text>
            <Text style={styles.instructionsItem}>1. Check your phone for a payment prompt</Text>
            <Text style={styles.instructionsItem}>2. Enter your mobile money PIN to approve</Text>
            <Text style={styles.instructionsItem}>3. Wait for confirmation on this screen</Text>
          </View>
        ) : null}

        {payment.provider === "CARD" && payment.authorizationUrl && !isComplete && !isFailed ? (
          <Button title="Open Secure Checkout" onPress={handleOpenCheckout} style={{ marginTop: 16 }} />
        ) : null}

        {payment.sandbox && !isComplete && !isFailed ? (
          <View style={styles.sandboxBox}>
            <Text style={styles.sandboxTitle}>Sandbox mode</Text>
            <Text style={styles.sandboxText}>
              No live payment provider is configured. Tap below to simulate approving the payment.
            </Text>
            <Button
              title="Simulate Payment Approval"
              onPress={handleSandboxConfirm}
              loading={confirming}
              variant="accent"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : null}

        {isFailed && payment.failureReason ? (
          <Text style={styles.errorText}>{payment.failureReason}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {isFailed ? (
          <Button title="Go Back" variant="outline" onPress={() => navigation.goBack()} />
        ) : isComplete ? (
          <Button title="View My Bookings" onPress={() => navigation.navigate("MainTabs")} />
        ) : (
          <View style={styles.waitingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.waitingText}>Waiting for payment confirmation...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  header: { alignItems: "center", paddingTop: 70, paddingBottom: 20, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  body: { padding: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  rowHighlight: { color: colors.primary },
  messageBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
    alignItems: "flex-start",
  },
  messageText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },
  instructions: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 10 },
  instructionsItem: { fontSize: 13, color: colors.textMuted, marginBottom: 6, lineHeight: 18 },
  sandboxBox: {
    marginTop: 20,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  sandboxTitle: { fontSize: 14, fontWeight: "700", color: "#92400e" },
  sandboxText: { fontSize: 12, color: "#92400e", marginTop: 6, lineHeight: 17 },
  errorText: { color: colors.danger, textAlign: "center", marginTop: 16, fontSize: 14 },
  footer: { padding: 20, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  waitingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  waitingText: { fontSize: 14, color: colors.textMuted },
});
