import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { EmergencyContact } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EmergencyContacts">;

export default function EmergencyContactsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getEmergencyContacts(user.id);
      setContacts(data);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not load contacts.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert("Log in required", "Please log in to manage emergency contacts.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }
      load();
    }, [user, load, navigation])
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelationship("");
    setIsPrimary(false);
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!user) return;
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing info", "Name and phone number are required.");
      return;
    }
    setSaving(true);
    try {
      await api.addEmergencyContact(user.id, {
        name: name.trim(),
        phoneNumber: phone.trim(),
        relationship: relationship.trim() || undefined,
        isPrimary,
      });
      resetForm();
      await load();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contact: EmergencyContact) => {
    if (!user) return;
    Alert.alert("Remove contact", `Remove ${contact.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteEmergencyContact(user.id, contact.id);
            await load();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const callContact = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber.replace(/\s/g, "")}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSub}>People to reach in an emergency</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          showForm ? (
            <View style={styles.form}>
              <Input label="Name" value={name} onChangeText={setName} placeholder="Full name" />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="+233..."
                keyboardType="phone-pad"
              />
              <Input
                label="Relationship (optional)"
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g. Spouse, Parent"
              />
              <TouchableOpacity
                style={styles.primaryToggle}
                onPress={() => setIsPrimary((v) => !v)}
              >
                <Ionicons
                  name={isPrimary ? "checkbox" : "square-outline"}
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.primaryLabel}>Set as primary contact</Text>
              </TouchableOpacity>
              <Button title="Save Contact" onPress={handleAdd} loading={saving} />
              <Button title="Cancel" variant="outline" onPress={resetForm} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <Button
              title="Add Emergency Contact"
              onPress={() => setShowForm(true)}
              style={{ marginBottom: 16 }}
            />
          )
        }
        ListEmptyComponent={
          !loading && !showForm ? (
            <Text style={styles.empty}>No emergency contacts yet. Add someone you trust.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.contactTop}>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.isPrimary ? (
                  <View style={styles.primaryPill}>
                    <Text style={styles.primaryPillText}>Primary</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
              {item.relationship ? (
                <Text style={styles.contactRel}>{item.relationship}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => callContact(item.phoneNumber)} style={styles.iconBtn}>
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  list: { padding: 16 },
  form: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  primaryToggle: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  primaryLabel: { fontSize: 14, color: colors.text },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  contactTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactName: { fontSize: 15, fontWeight: "700", color: colors.text },
  primaryPill: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  primaryPillText: { fontSize: 10, color: colors.success, fontWeight: "700" },
  contactPhone: { fontSize: 13, color: colors.text, marginTop: 2 },
  contactRel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  iconBtn: { padding: 6 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
});
