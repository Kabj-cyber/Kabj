import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={["#0f3d22", "#14532d", "#1a5c33"]}
      style={styles.container}
    >
      {/* ---------- Hero: logo + wordmark ---------- */}
      <View style={styles.hero}>
        <Svg width={72} height={82} viewBox="0 0 100 112">
          {/* pin outline */}
          <Path
            d="M50 4 C24 4 4 23 4 48 C4 78 50 108 50 108 C50 108 96 78 96 48 C96 23 76 4 50 4 Z"
            fill="none"
            stroke="#f5c542"
            strokeWidth={7}
          />
          {/* star */}
          <Path
            d="M50 20 L54.5 32.5 L68 33 L57.5 41 L61 54 L50 46.5 L39 54 L42.5 41 L32 33 L45.5 32.5 Z"
            fill="#f0951f"
          />
          {/* leaf / ribbon swoosh */}
          <Path
            d="M20 66 C34 58 66 58 80 66 C66 74 60 82 50 90 C40 82 34 74 20 66 Z"
            fill="#2e9e52"
          />
          <Path
            d="M22 72 C36 66 64 66 78 72 C64 78 58 84 50 92 C42 84 36 78 22 72 Z"
            fill="#7fc242"
          />
        </Svg>

        <Text style={styles.brand}>DeTour</Text>
        <Text style={styles.tagline}>Discover Ghana.{"\n"}Live the Culture.</Text>

        {/* ---------- Scenic illustration ---------- */}
        <Svg width="100%" height={260} viewBox="0 0 400 300" style={styles.scene}>
          <Defs>
            <RadialGradient id="sunGlow" cx="50%" cy="62%" r="55%">
              <Stop offset="0%" stopColor="#f5c542" stopOpacity={0.55} />
              <Stop offset="45%" stopColor="#e8871e" stopOpacity={0.25} />
              <Stop offset="100%" stopColor="#e8871e" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Rect x={0} y={0} width={400} height={300} fill="url(#sunGlow)" />

          {/* sun rays */}
          <G opacity={0.5}>
            {[-60, -40, -20, 0, 20, 40, 60].map((angle, i) => (
              <Path
                key={angle}
                d="M200,205 L186,40 L214,40 Z"
                fill="#f7c65a"
                opacity={i % 2 === 0 ? 0.18 : 0.09}
                transform={`rotate(${angle} 200 205)`}
              />
            ))}
          </G>

          {/* clouds */}
          <G fill="#c9822f" opacity={0.35}>
            <Ellipse cx={60} cy={85} rx={34} ry={10} />
            <Ellipse cx={90} cy={80} rx={22} ry={8} />
            <Ellipse cx={330} cy={70} rx={30} ry={9} />
            <Ellipse cx={300} cy={65} rx={18} ry={7} />
            <Ellipse cx={250} cy={100} rx={26} ry={8} />
            <Ellipse cx={130} cy={110} rx={20} ry={7} />
          </G>

          {/* distant hills */}
          <Path
            d="M0,215 Q60,190 130,210 T260,205 T400,218 L400,300 L0,300 Z"
            fill="#0a3319"
            opacity={0.55}
          />

          {/* water */}
          <G opacity={0.5} stroke="#4fa5c4" strokeWidth={1.4} fill="none">
            <Path d="M20,238 Q45,234 70,238" />
            <Path d="M15,248 Q40,244 65,248" />
            <Path d="M300,240 Q330,236 360,240" />
            <Path d="M295,250 Q325,246 355,250" />
          </G>

          {/* foreground land */}
          <Path
            d="M0,258 Q100,240 200,254 T400,252 L400,300 L0,300 Z"
            fill="#0a2d16"
          />

          {/* Independence Arch */}
          <G>
            <Path d="M197 128 L203 128 L207 142 L193 142 Z" fill="#12210f" />
            <Rect x={148} y={144} width={104} height={18} rx={2} fill="#cbb08a" />
            <SvgText
              x={200}
              y={156}
              fontSize={7}
              fill="#7a6748"
              textAnchor="middle"
              fontWeight="bold"
            >
              AD 1957
            </SvgText>
            <Rect x={152} y={166} width={96} height={10} fill="#bfa47c" />
            <SvgText
              x={200}
              y={174}
              fontSize={5.5}
              fill="#6b5a3f"
              textAnchor="middle"
            >
              FREEDOM AND JUSTICE
            </SvgText>
            <Rect x={152} y={176} width={14} height={80} fill="#c9ad82" />
            <Rect x={186} y={176} width={14} height={80} fill="#c9ad82" />
            <Rect x={214} y={176} width={14} height={80} fill="#c9ad82" />
            <Rect x={234} y={176} width={14} height={80} fill="#c9ad82" />
            <Rect x={148} y={252} width={104} height={8} fill="#b39a72" />
          </G>

          {/* birds */}
          <G stroke="#0d2410" strokeWidth={1.6} fill="none" opacity={0.75}>
            <Path d="M60,60 Q66,52 72,60 Q78,52 84,60" />
            <Path d="M110,95 Q115,89 120,95 Q125,89 130,95" />
            <Path d="M300,150 Q305,144 310,150 Q315,144 320,150" />
            <Path d="M340,110 Q345,104 350,110 Q355,104 360,110" />
          </G>

          {/* large left palm */}
          <G>
            <Path
              d="M55,290 C50,250 62,215 70,190"
              stroke="#0a2c14"
              strokeWidth={5}
              fill="none"
            />
            <Path d="M70,190 C40,180 20,190 8,178" fill="#0d3d1f" />
            <Path d="M70,190 C48,165 30,160 18,142" fill="#0d3d1f" />
            <Path d="M70,190 C64,158 70,140 62,120" fill="#0d3d1f" />
            <Path d="M70,190 C82,160 100,150 108,132" fill="#0d3d1f" />
            <Path d="M70,190 C92,178 112,180 126,170" fill="#0d3d1f" />
          </G>

          {/* small right palms */}
          <G>
            <Path
              d="M320,275 C317,250 324,228 330,212"
              stroke="#0a2c14"
              strokeWidth={4}
              fill="none"
            />
            <Path d="M330,212 C312,204 298,210 288,200" fill="#0d3d1f" />
            <Path d="M330,212 C316,192 304,188 296,174" fill="#0d3d1f" />
            <Path d="M330,212 C340,190 352,184 358,170" fill="#0d3d1f" />
            <Path d="M330,212 C346,204 360,206 370,198" fill="#0d3d1f" />
          </G>
        </Svg>
      </View>

      {/* ---------- Actions ---------- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.secondaryButtonText}>Explore as Guest</Text>
        </TouchableOpacity>

        <Text style={styles.builtBy}>Built with ❤️ for Ghana</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", paddingTop: 56 },
  scene: { marginTop: 8, flex: 1 },
  brand: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  primaryButton: {
    backgroundColor: "#f5c542",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#14532d",
    fontSize: 17,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  builtBy: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 12,
  },
});
