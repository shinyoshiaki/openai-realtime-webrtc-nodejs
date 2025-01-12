import { OpusEncoder } from "@discordjs/opus";

import { RealtimeWebRTC } from "../../src/index.js";

const data = await (await fetch("http://localhost:3000/session")).json();
console.log(data);
const {
  client_secret: { value },
} = data;

const encoder = new OpusEncoder(48000, 1);

const session = await RealtimeWebRTC.init({
  token: value,
  onInboundTrack: (track) => {
    track.onReceiveRtp.subscribe((rtp) => {
      const pcm = encoder.decode(rtp.payload);
      console.log("pcm", pcm);
    });
  },
});

session.datachannel.onmessage = (e) => {
  console.log("datachannel", e.data);
};
