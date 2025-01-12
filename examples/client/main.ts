import Speaker from "speaker";
import opus from "@discordjs/opus";

import { OpenAIWebRTC } from "../../src/index.js";
import { createMicOpusStream } from "./mic.js";

const decoder = new opus.OpusEncoder(48000, 2);
const speaker = new Speaker({
  channels: 2,
  bitDepth: 16,
  sampleRate: 48000,
});

const data = await (await fetch("http://localhost:3000/session")).json();
console.log(data);
const {
  client_secret: { value },
} = data;

const session = await OpenAIWebRTC.init({
  token: value,
  onInboundTrack: (track) => {
    track.onReceiveRtp.subscribe((rtp) => {
      const pcm = decoder.decode(rtp.payload);
      speaker.write(pcm);
    });
  },
});

session.datachannel.onmessage = (e) => {
  console.log("datachannel", e.data);
};

const mic = createMicOpusStream((opus) => {
  session.writeOpusFrame(opus);
});

session.datachannel.onopen = () => {
  session.datachannel.send(
    JSON.stringify({
      type: "response.create",
      response: {
        modalities: ["audio", "text"],
        instructions: "挨拶をしてください",
      },
    }),
  );
  mic.start();
};

session.onclosed = () => {
  mic.close();
};
