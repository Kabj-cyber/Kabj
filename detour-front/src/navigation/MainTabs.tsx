import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { MainTabsParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import FacilitiesMapScreen from "../screens/FacilitiesMapScreen";
import SafetyScreen from "../screens/SafetyScreen";
import BookingsScreen from "../screens/BookingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Explore: "compass",
  FacilitiesMap: "map",
  Safety: "shield-checkmark",
  Bookings: "calendar",
  Profile: "person",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : (`${ICONS[route.name]}-outline` as any)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="FacilitiesMap"
        component={FacilitiesMapScreen}
        options={{ title: "Map" }}
      />
      <Tab.Screen name="Safety" component={SafetyScreen} options={{ title: "Safety" }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: "Bookings" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
