import { NavigatorScreenParams } from "@react-navigation/native";
import { Attraction } from "../types";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  AttractionDetail: { attraction: Attraction };
  BookTour: { attraction: Attraction };
  Payment: { paymentId: number; attractionTitle: string };
  EmergencyContacts: undefined;
  SOSRecording: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Explore: undefined;
  FacilitiesMap: undefined;
  Safety: undefined;
  Bookings: undefined;
  Profile: undefined;
};
