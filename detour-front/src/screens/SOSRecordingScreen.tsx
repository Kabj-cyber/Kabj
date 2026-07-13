import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "SOSRecording">;

const MAX_SECONDS = 300; // 5 minutes

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SOSRecordingScreen({ navigation }: Props) {
  const { user } = useAuth();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const [phase, setPhase] = useState<"idle" | "recording" | "submitting" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const captureLocation = async () => {
    setLocationError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError("Location permission denied.");
      return null;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setLocation(coords);
    return coords;
  };

  const startRecording = async () => {
    try {
      const mic = await Audio.requestPermissionsAsync();
      if (!mic.granted) {
        Alert.alert("Microphone required", "Allow microphone access to record an SOS message.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const coords = await captureLocation();
      if (!coords) {
        Alert.alert(
          "Location required",
          "GPS location is needed to send your position to authorities.",
          [{ text: "Try again", onPress: () => captureLocation() }, { text: "Cancel" }]
        );
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      elapsedRef.current = 0;
      setElapsed(0);
      setRecordingUri(null);
      setPhase("recording");

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECONDS) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          stopRecording(true);
        }
      }, 1000);

      Alert.alert(
        "Recording started",
        "Describe your situation clearly. Your location is being captured. You can also dial 191 now.",
        [
          { text: "Call Police (191)", onPress: () => Linking.openURL("tel:191") },
          { text: "Continue", style: "cancel" },
        ]
      );
    } catch (e: any) {
      Alert.alert("Recording failed", e.message || "Could not start recording.");
      setPhase("idle");
    }
  };

  const stopRecording = async (autoStop = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;
      setPhase("idle");

      if (autoStop) {
        Alert.alert("5-minute limit reached", "Recording stopped. Tap Send to Authorities to submit.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not stop recording.");
      setPhase("idle");
    }
  };

  const submitIncident = async () => {
    if (!user) {
      Alert.alert("Log in required", "Please log in first.");
      return;
    }
    if (!location) {
      const coords = await captureLocation();
      if (!coords) {
        Alert.alert("Location required", "Cannot submit without GPS coordinates.");
        return;
      }
    }

    setPhase("submitting");
    try {
      const result = await api.submitSafetyIncident({
        userId: user.id,
        latitude: location!.lat,
        longitude: location!.lng,
        durationSeconds: elapsed,
        audioUri: recordingUri,
      });

      setPhase("done");
      Alert.alert(
        "Sent to authorities",
        result.notes ||
          "Your audio recording and GPS location have been submitted to local dispatch.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      setPhase("idle");
      Alert.alert("Submission failed", e.message || "Could not reach the backend.");
    }
  };

  const remaining = MAX_SECONDS - elapsed;
  const progress = elapsed / MAX_SECONDS;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Recording</Text>
        <Text style={styles.headerSub}>Up to 5 minutes · GPS + audio to authorities</Text>
      </View>

      <View style={styles.panel}>
        <View style={[styles.pulse, phase === "recording" && styles.pulseActive]}>
          <Ionicons
            name={phase === "recording" ? "mic" : "radio"}
            size={48}
            color={phase === "recording" ? "#fff" : colors.danger}
          />
        </View>

        <Text style={styles.timer}>
          {phase === "recording" ? formatTime(elapsed) : formatTime(0)}
        </Text>
        <Text style={styles.timerHint}>
          {phase === "recording"
            ? `${formatTime(remaining)} remaining`
            : `Maximum ${formatTime(MAX_SECONDS)}`}
        </Text>

        {phase === "recording" ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        ) : null}

        {location ? (
          <View style={styles.locationBox}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.locationText}>
              GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </Text>
          </View>
        ) : locationError ? (
          <Text style={styles.locationError}>{locationError}</Text>
        ) : (
          <Text style={styles.locationHint}>Location captured when recording starts</Text>
        )}

        {recordingUri ? (
          <Text style={styles.recordedHint}>Audio ready ({formatTime(elapsed)} recorded)</Text>
        ) : null}

        <View style={styles.actions}>
          {phase === "idle" && !recordingUri ? (
            <Button
              title="Start Recording"
              onPress={startRecording}
              style={{ backgroundColor: colors.danger }}
            />
          ) : null}

          {phase === "recording" ? (
            <Button
              title="Stop Recording"
              onPress={() => stopRecording(false)}
              variant="outline"
              style={{ borderColor: colors.danger }}
            />
          ) : null}

          {recordingUri && phase !== "submitting" && phase !== "done" ? (
            <>
              <Button
                title="Send to Authorities"
                onPress={submitIncident}
                style={{ backgroundColor: colors.danger, marginTop: 10 }}
              />
              <Button
                title="Record Again"
                variant="outline"
                onPress={() => {
                  setRecordingUri(null);
                  setElapsed(0);
                }}
                style={{ marginTop: 8 }}
              />
            </>
          ) : null}

          {phase === "submitting" ? (
            <Button title="Sending..." loading disabled onPress={() => {}} />
          ) : null}
        </View>

        <TouchableOpacity style={styles.callPolice} onPress={() => Linking.openURL("tel:191")}>
          <Ionicons name="call" size={18} color={colors.danger} />
          <Text style={styles.callPoliceText}>Call Ghana Police (191) now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: colors.danger,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },
  panel: {
    margin: 16,
    marginTop: -8,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  pulseActive: { backgroundColor: colors.danger },
  timer: { fontSize: 48, fontWeight: "800", color: colors.text },
  timerHint: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.danger },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: radius.sm,
    width: "100%",
  },
  locationText: { fontSize: 12, color: colors.primary, flex: 1 },
  locationHint: { fontSize: 12, color: colors.textMuted, marginTop: 16 },
  locationError: { fontSize: 12, color: colors.danger, marginTop: 16 },
  recordedHint: { fontSize: 13, color: colors.success, marginTop: 12, fontWeight: "600" },
  actions: { width: "100%", marginTop: 20 },
  callPolice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
  },
  callPoliceText: { color: colors.danger, fontWeight: "700", fontSize: 14 },
});
