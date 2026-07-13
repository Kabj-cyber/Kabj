import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { PaymentMethodType } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "BookTour">;

const PAYMENT_METHODS: {
  id: PaymentMethodType;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    id: "MTN_MOMO",
    label: "MTN MoMo",
    subtitle: "Pay with MTN Mobile Money",
    icon: "phone-portrait-outline",
    color: "#ffcc00",
  },
  {
    id: "VODAFONE_CASH",
    label: "Vodafone Cash",
    subtitle: "Pay with Vodafone Cash",
    icon: "phone-portrait-outline",
    color: "#e60000",
  },
  {
    id: "CARD",
    label: "Card",
    subtitle: "Visa, Mastercard, or Verve",
    icon: "card-outline",
    color: colors.primary,
  },
];

export default function BookTourScreen({ route, navigation }: Props) {
  const { attraction } = route.params;
  const { user } = useAuth();
  const [people, setPeople] = useState(2);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethodType>("MTN_MOMO");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");

  const basePrice = attraction.basePrice != null ? Number(attraction.basePrice) : 0;
  const totalAmount = basePrice * people;
  const needsPhone = method !== "CARD";

  const handleBook = async () => {
    if (!user) {
      Alert.alert("Login required", "Please log in before booking a tour.");
      navigation.navigate("Login");
      return;
    }
    if (needsPhone && !phoneNumber.trim()) {
      Alert.alert("Phone required", "Enter the mobile money number to charge.");
      return;
    }

    setLoading(true);
    try {
      const booking = await api.createBooking({
        touristId: user.id,
        attractionId: attraction.id,
        totalAmount,
      });

      const payment = await api.initiatePayment({
        bookingId: booking.id,
        method,
        phoneNumber: needsPhone ? phoneNumber.trim() : undefined,
        email: user.email,
      });

      navigation.replace("Payment", {
        paymentId: payment.id,
        attractionTitle: attraction.title,
      });
    } catch (e: any) {
      Alert.alert("Booking failed", e.message || "Could not create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Tour</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.summaryCard}>
          <View style={styles.thumb}>
            <Ionicons name="image-outline" size={22} color={colors.textMuted} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.summaryTitle}>{attraction.title}</Text>
            <Text style={styles.summarySub}>{attraction.region} Region</Text>
          </View>
        </View>

        <Stepper
          label="Number of People"
          value={people}
          onDecrease={() => setPeople((p) => Math.max(1, p - 1))}
          onIncrease={() => setPeople((p) => p + 1)}
        />

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((item) => {
          const selected = method === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.methodCard, selected && styles.methodCardSelected]}
              onPress={() => setMethod(item.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodLabel}>{item.label}</Text>
                <Text style={styles.methodSub}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={selected ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        {needsPhone ? (
          <Input
            label="Mobile Money Number"
            placeholder="e.g. 0244123456"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        ) : (
          <View style={styles.cardNotice}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text style={styles.cardNoticeText}>
              You'll complete payment on a secure checkout page using {user?.email}.
            </Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>GHS {totalAmount.toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Pay & Confirm Booking" onPress={handleBook} loading={loading} />
      </View>
    </View>
  );
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity style={styles.stepBtn} onPress={onDecrease}>
          <Ionicons name="remove" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={onIncrease}>
          <Ionicons name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: "#eceae3",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: { fontWeight: "700", fontSize: 15, color: colors.text },
  summarySub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepValue: { fontSize: 15, fontWeight: "700", color: colors.text, minWidth: 20, textAlign: "center" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 22,
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  methodCardSelected: { borderColor: colors.primary, backgroundColor: "#f0fdf4" },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  methodSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardNotice: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: radius.md,
    padding: 14,
    marginTop: 4,
    alignItems: "flex-start",
  },
  cardNoticeText: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 17 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 15, color: colors.textMuted },
  totalValue: { fontSize: 20, fontWeight: "800", color: colors.primary },
  footer: { padding: 20, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
});
