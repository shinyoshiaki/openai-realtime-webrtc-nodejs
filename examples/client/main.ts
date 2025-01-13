import { OpenAIWebRTC } from "../../src/index.js";
import { createMicOpusStream } from "./mic.js";
import { createOpusSpeaker } from "./speaker.js";

const speaker = createOpusSpeaker();

const data = await (await fetch("http://localhost:3000/session")).json();
console.log(data);
const {
  client_secret: { value },
} = data;

const session = await OpenAIWebRTC.init({
  token: value,
  onInboundTrack: (track) => {
    track.onReceiveRtp.subscribe((rtp) => {
      speaker.write(rtp.payload);
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
  session.sendMessage({
    type: "request.create",
    request: {
      modalities: ["audio", "text"],
      instructions: "say hello",
    },
  });
  mic.start();
};

session.onclosed = () => {
  mic.close();
};
