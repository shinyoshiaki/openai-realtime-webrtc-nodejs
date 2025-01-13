import Speaker from "speaker";
import opus from "@discordjs/opus";

export const createOpusSpeaker = () => {
  const decoder = new opus.OpusEncoder(48000, 2);
  const speaker = new Speaker({
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
  });

  return {
    write: (opus: Buffer) => {
      const pcm = decoder.decode(opus);
      speaker.write(pcm);
    },
    close: () => {
      speaker.close(false);
    },
  };
};
