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

        {/* ---------- Isometric monument illustration ---------- */}
        <Svg width="100%" height={280} viewBox="0 0 400 320" style={styles.scene}>
          <Defs>
            <RadialGradient id="haloGlow" cx="50%" cy="58%" r="42%">
              <Stop offset="0%" stopColor="#e8d98a" stopOpacity={0.35} />
              <Stop offset="60%" stopColor="#c9b96a" stopOpacity={0.12} />
              <Stop offset="100%" stopColor="#c9b96a" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="doorGlow" cx="50%" cy="30%" r="80%">
              <Stop offset="0%" stopColor="#f6d873" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#e8a83b" stopOpacity={0.15} />
            </RadialGradient>
          </Defs>

          <Ellipse cx={200} cy={186} rx={190} ry={150} fill="url(#haloGlow)" />

          {/* faint clouds */}
          <G fill="#3d5a3f" opacity={0.4}>
            <Ellipse cx={70} cy={100} rx={36} ry={8} />
            <Ellipse cx={100} cy={94} rx={20} ry={6} />
            <Ellipse cx={330} cy={110} rx={40} ry={9} />
            <Ellipse cx={295} cy={104} rx={20} ry={6} />
          </G>

          {/* birds */}
          <G stroke="#12321c" strokeWidth={1.6} fill="none" opacity={0.7}>
            <Path d="M310,140 Q315,134 320,140 Q325,134 330,140" />
            <Path d="M345,166 Q349,161 353,166 Q357,161 361,166" />
          </G>

          {/* ---- isometric step base (widest) ---- */}
          <Path d="M200,236 L296,254 L200,272 L104,254 Z" fill="#e4d6b8" />
          <Path d="M104,254 L200,272 L200,288 L104,270 Z" fill="#b39a6f" />
          <Path d="M200,272 L296,254 L296,270 L200,288 Z" fill="#c9b183" />

          {/* ---- middle step ---- */}
          <Path d="M200,220 L272,235 L200,250 L128,235 Z" fill="#ecdfc4" />
          <Path d="M128,235 L200,250 L200,264 L128,249 Z" fill="#b8a074" />
          <Path d="M200,250 L272,235 L272,249 L200,264 Z" fill="#cdb689" />

          {/* ---- cube body with doorway ---- */}
          <Path d="M200,158 L252,183 L200,208 L148,183 Z" fill="#f0e4ca" />
          <Path d="M148,183 L200,208 L200,250 L148,225 Z" fill="#b9a077" />
          <Path d="M200,208 L252,183 L252,225 L200,250 Z" fill="#d3bd91" />

          {/* glowing doorway slit */}
          <Path
            d="M200,210 L212,216 L212,246 L200,240 Z"
            fill="url(#doorGlow)"
          />
          <Path
            d="M200,210 L188,216 L188,246 L200,240 Z"
            fill="#8a6f3a"
            opacity={0.55}
          />

          {/* ---- folded chevron roof ---- */}
          <Path d="M200,120 L268,152 L200,184 L132,152 Z" fill="#f2e7cd" />
          <Path d="M132,152 L200,184 L200,196 L132,164 Z" fill="#c1aa7e" />
          <Path d="M200,184 L268,152 L268,164 L200,196 Z" fill="#d8c398" />

          <Path d="M200,132 L246,154 L200,176 L154,154 Z" fill="#e9dcbe" />
          <Path d="M154,154 L200,176 L200,186 L154,164 Z" fill="#b39c72" />
          <Path d="M200,176 L246,154 L246,164 L200,186 Z" fill="#cbb589" />

          {/* star finial */}
          <Path
            d="M200,98 L203,107 L212,107 L204.5,112.5 L207.5,121 L200,115.5 L192.5,121 L195.5,112.5 L188,107 L197,107 Z"
            fill="#12321c"
          />

          {/* potted plants */}
          <G>
            <Ellipse cx={90} cy={252} rx={22} ry={16} fill="#1f5c34" />
            <Path
              d="M90,238 L82,214 M90,238 L92,210 M90,238 L100,216"
              stroke="#123a1f"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
            <Ellipse cx={310} cy={252} rx={22} ry={16} fill="#1f5c34" />
            <Path
              d="M310,238 L302,214 M310,238 L312,210 M310,238 L320,216"
              stroke="#123a1f"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          </G>

          {/* grass line */}
          <Rect x={0} y={262} width={400} height={16} fill="#1f5c34" opacity={0.9} />

          {/* water reflection */}
          <Rect x={0} y={278} width={400} height={42} fill="#0b3320" />
          <G opacity={0.35} stroke="#4fa5c4" strokeWidth={1.2} fill="none">
            <Path d="M40,292 Q70,288 100,292" />
            <Path d="M60,304 Q90,300 120,304" />
            <Path d="M280,294 Q310,290 340,294" />
            <Path d="M270,306 Q300,302 330,306" />
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
