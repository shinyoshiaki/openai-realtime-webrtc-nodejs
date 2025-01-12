import opus from "@discordjs/opus";
import portAudio from "naudiodon";

export const createMicOpusStream = (onFrame: (opus: Buffer) => any) => {
  const SAMPLING_RATE = 48000; // サンプリングレート (Hz)
  const CHANNELS = 2; // チャンネル数
  const BIT_DEPTH = 16; // ビット深度
  const FRAME_DURATION = 20; // フレームの時間 (ms)
  const BYTES_PER_SAMPLE = (BIT_DEPTH / 8) * CHANNELS;
  const SAMPLES_PER_FRAME = Math.floor(SAMPLING_RATE * (FRAME_DURATION / 1000));
  const FRAME_SIZE = SAMPLES_PER_FRAME * BYTES_PER_SAMPLE;
  const ai = portAudio.AudioIO({
    inOptions: {
      channelCount: CHANNELS,
      sampleFormat: BIT_DEPTH,
      sampleRate: SAMPLING_RATE,
    },
  });
  const encoder = new opus.OpusEncoder(SAMPLING_RATE, CHANNELS);

  let buffer = Buffer.alloc(0);
  ai.on("data", (b) => {
    buffer = Buffer.concat([buffer, b]);

    while (buffer.length >= FRAME_SIZE) {
      const frame = buffer.subarray(0, FRAME_SIZE);
      buffer = buffer.subarray(FRAME_SIZE);
      const encoded = encoder.encode(frame);
      onFrame(encoded);
    }
  });

  return {
    start: () => {
      ai.start();
    },
    close: () => {
      ai.quit();
    },
  };
};
