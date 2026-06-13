import { Audio } from "expo-av";
import { Platform } from "react-native";

const FILES = {
  success:      require("../assets/sounds/success.wav"),
  receive:      require("../assets/sounds/receive.wav"),
  error:        require("../assets/sounds/error.wav"),
  pinClick:     require("../assets/sounds/pin-click.wav"),
  unlock:       require("../assets/sounds/unlock.wav"),
  notification: require("../assets/sounds/notification.wav"),
} as const;

type SoundKey = keyof typeof FILES;

const cache = new Map<SoundKey, Audio.Sound>();
let audioModeSet = false;

async function ensureMode() {
  if (audioModeSet || Platform.OS === "web") return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
    audioModeSet = true;
  } catch {}
}

async function play(key: SoundKey) {
  if (Platform.OS === "web") return;
  try {
    await ensureMode();
    let sound = cache.get(key);
    if (!sound) {
      const { sound: s } = await Audio.Sound.createAsync(FILES[key], { shouldPlay: false });
      cache.set(key, s);
      sound = s;
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {}
}

export const SoundManager = {
  success:      () => play("success"),
  receive:      () => play("receive"),
  error:        () => play("error"),
  pinClick:     () => play("pinClick"),
  unlock:       () => play("unlock"),
  notification: () => play("notification"),
  preload: async () => {
    if (Platform.OS === "web") return;
    await ensureMode();
    for (const key of Object.keys(FILES) as SoundKey[]) {
      if (!cache.has(key)) {
        try {
          const { sound } = await Audio.Sound.createAsync(FILES[key], { shouldPlay: false });
          cache.set(key, sound);
        } catch {}
      }
    }
  },
};
