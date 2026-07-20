import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../api/client";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors, radius } from "../../theme";
import { Booking } from "../../types";

type ScanPhase = "ready" | "submitting" | "success" | "error";

export default function GuideScanScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const lockedRef = useRef(false);

  const resetScan = useCallback(() => {
    lockedRef.current = false;
    setPhase("ready");
    setErrorMessage(null);
    setCompletedBooking(null);
  }, []);

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (lockedRef.current || !user) return;
      const token = result.data?.trim();
      if (!token) return;

      lockedRef.current = true;
      setPhase("submitting");
      setErrorMessage(null);

      try {
        const booking = await api.scanBooking(token, user.id);
        setCompletedBooking(booking);
        setPhase("success");
      } catch (e: any) {
        setErrorMessage(e?.message || "Could not complete this booking.");
        setPhase("error");
      }
    },
    [user]
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          Allow camera access so you can scan tourist check-in QR codes.
        </Text>
        <Button title="Allow camera" onPress={requestPermission} style={styles.permBtn} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.permBody}>Log in as a guide to scan bookings.</Text>
      </View>
    );
  }

  const scanningEnabled = isFocused && phase === "ready";
  const attractionName =
    completedBooking?.attraction?.title || `Booking #${completedBooking?.id ?? ""}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scan check-in</Text>
      <Text style={styles.sub}>Point the camera at the tourist’s QR code.</Text>

      <View style={styles.cameraWrap}>
        {isFocused ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanningEnabled ? handleBarcodeScanned : undefined}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.cameraPlaceholder]} />
        )}

        {phase === "ready" ? (
          <View style={styles.frame} pointerEvents="none" />
        ) : null}

        {phase === "submitting" ? (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Completing tour…</Text>
          </View>
        ) : null}

        {phase === "success" ? (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>
              <Ionicons name="checkmark-circle" size={52} color={colors.success} />
              <Text style={styles.resultTitle}>Tour completed — payout initiated</Text>
              <Text style={styles.resultSub}>{attractionName}</Text>
              <Button title="Scan next" onPress={resetScan} style={styles.resultBtn} />
            </View>
          </View>
        ) : null}

        {phase === "error" ? (
          <View style={styles.overlay}>
            <View style={styles.resultCard}>
              <Ionicons name="alert-circle" size={52} color={colors.danger} />
              <Text style={styles.resultTitle}>Scan failed</Text>
              <Text style={styles.resultSub}>{errorMessage}</Text>
              <Button title="Scan again" onPress={resetScan} style={styles.resultBtn} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: 20,
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  cameraPlaceholder: { backgroundColor: "#111" },
  frame: {
    position: "absolute",
    top: "22%",
    left: "14%",
    right: "14%",
    bottom: "28%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  overlayText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  resultCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  resultSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
  },
  resultBtn: { alignSelf: "stretch", marginTop: 4 },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  permTitle: { fontSize: 18, fontWeight: "800", color: colors.text, textAlign: "center" },
  permBody: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  permBtn: { alignSelf: "stretch", marginTop: 8 },
});
