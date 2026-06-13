import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f4f7ff" }}>
        <ActivityIndicator size="large" color="#1a5e9a" />
      </View>
    );
  }

  if (!user) return <Redirect href="/onboarding" />;
  if (user.role === "admin") return <Redirect href="/(admin)/dashboard" />;
  if (user.role === "investor") return <Redirect href="/(investor)/dashboard" />;
  return <Redirect href="/(business)/dashboard" />;
}
