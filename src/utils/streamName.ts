export function generateHandUpStreamName(roomUid: string, userUid: string) {
  return roomUid + userUid + ":handup";
}
