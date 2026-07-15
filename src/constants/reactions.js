export const REACTIONS = [
  { type: "like", code: "1f44d", label: "Curtir" },
  { type: "love", code: "2764", label: "Amei" },
  { type: "haha", code: "1f602", label: "Haha" },
  { type: "wow", code: "1f62e", label: "Uau" },
  { type: "sad", code: "1f622", label: "Triste" },
  { type: "angry", code: "1f620", label: "Grr" },
];

export function getReactionCode(type) {
  return REACTIONS.find((r) => r.type === type)?.code ?? "1f44d";
}
