import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useColors } from "@/hooks/useColors";

export default function BusinessEditProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { COUNTRIES } = useAppData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [country, setCountry] = useState(user?.country ?? "Nigeria");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "B";
  const hasChanges =
    name !== (user?.name ?? "") ||
    phone !== (user?.phone ?? "") ||
    country !== (user?.country ?? "Nigeria") ||
    bio !== (user?.bio ?? "") ||
    avatar !== (user?.avatar ?? "");

  const pickAvatar = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported", "Photo upload requires the mobile app.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === "web") {
      pickAvatar();
      return;
    }
    Alert.alert("Profile Photo", "Choose how to update your photo", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickAvatar },
      avatar ? { text: "Remove Photo", style: "destructive", onPress: () => setAvatar("") } : undefined,
      { text: "Cancel", style: "cancel" },
    ].filter(Boolean) as any[]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }
    setSaving(true);
    await updateProfile({ name: name.trim(), phone: phone.trim(), country, bio: bio.trim(), avatar });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Business Profile</Text>
          <PressableScale
            onPress={handleSave}
            disabled={!hasChanges || saving}
            style={[styles.saveBtn, { backgroundColor: hasChanges && !saving ? "#2db56e" : colors.muted }]}
          >
            <Text style={[styles.saveBtnText, { color: hasChanges && !saving ? "#fff" : colors.mutedForeground }]}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(400)} style={styles.avatarSection}>
          <Pressable onPress={handleAvatarPress} style={styles.avatarPressable}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: "#2db56e" }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: "#2db56e", borderColor: colors.background }]}>
              <Feather name="camera" size={13} color="#fff" />
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>Tap to change photo</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(160).duration(400)} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FormField label="Full Name" icon="user" value={name} onChange={setName} placeholder="Your full name" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <FormField label="Phone" icon="phone" value={phone} onChange={setPhone} placeholder="e.g. 08012345678" keyboardType="phone-pad" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <Pressable style={styles.fieldRow} onPress={() => setShowCountryPicker((v) => !v)}>
            <View style={[styles.fieldIconWrap, { backgroundColor: colors.muted }]}>
              <Feather name="map-pin" size={15} color={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Country</Text>
              <Text style={[styles.fieldValue, { color: colors.foreground }]}>{country}</Text>
            </View>
            <Feather name={showCountryPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </Pressable>
          {showCountryPicker && (
            <View style={[styles.countryList, { borderTopColor: colors.borderLight }]}>
              {COUNTRIES.map((c) => (
                <Pressable key={c} style={[styles.countryItem, { borderBottomColor: colors.borderLight }]} onPress={() => { setCountry(c); setShowCountryPicker(false); }}>
                  <Text style={[styles.countryItemText, { color: c === country ? "#2db56e" : colors.foreground }]}>{c}</Text>
                  {c === country && <Feather name="check" size={14} color="#2db56e" />}
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Bio</Text>
          <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.bioInput, { color: colors.foreground }]}
              placeholder="Tell backers a bit about your business..."
              placeholderTextColor={colors.mutedForeground}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={[styles.bioCount, { color: colors.mutedForeground }]}>{bio.length}/200</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(280).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Account (read-only)</Text>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldIconWrap, { backgroundColor: colors.muted }]}>
                <Feather name="mail" size={15} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user?.email}</Text>
              </View>
              <View style={[styles.readOnlyBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.readOnlyText, { color: colors.mutedForeground }]}>Fixed</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.fieldRow}>
              <View style={[styles.fieldIconWrap, { backgroundColor: colors.muted }]}>
                <Feather name="briefcase" size={15} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Account Type</Text>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>Business Owner</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(340).duration(400)}>
          <PressableScale
            onPress={handleSave}
            disabled={!hasChanges || saving}
            style={[styles.saveBottomBtn, { backgroundColor: hasChanges && !saving ? "#2db56e" : colors.muted }]}
          >
            <Feather name="check" size={16} color={hasChanges && !saving ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.saveBottomText, { color: hasChanges && !saving ? "#fff" : colors.mutedForeground }]}>
              {saving ? "Saving changes..." : "Save Changes"}
            </Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label, icon, value, onChange, placeholder, keyboardType, colors,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.fieldIconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={15} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <TextInput
          style={[styles.fieldInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType ?? "default"}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 8 },
  avatarPressable: { position: "relative" },
  avatarImg: { width: 96, height: 96, borderRadius: 28 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#fff", fontSize: 34, fontWeight: "800", fontFamily: "Inter_700Bold" },
  avatarEditBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  avatarHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  divider: { height: 1, marginLeft: 58 },
  fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  fieldIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  fieldValue: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  fieldInput: { fontSize: 14, fontFamily: "Inter_500Medium", padding: 0, margin: 0 },
  countryList: { borderTopWidth: 1 },
  countryItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  countryItemText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bioCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  bioInput: { fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80, lineHeight: 21 },
  bioCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 6 },
  readOnlyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  readOnlyText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  saveBottomBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16 },
  saveBottomText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
