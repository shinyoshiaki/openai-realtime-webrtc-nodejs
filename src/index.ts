import {
  RTCPeerConnection,
  MediaStreamTrack,
  type RTCDataChannel,
} from "werift";

export class OpenAIWebRTC {
  readonly pc = new RTCPeerConnection();
  readonly outboundTrack = new MediaStreamTrack({ kind: "audio" });
  readonly datachannel: RTCDataChannel;

  static async init(...args: ConstructorParameters<typeof OpenAIWebRTC>) {
    const instance = new OpenAIWebRTC(...args);
    await instance.init();
    return instance;
  }

  constructor(
    private props: {
      token: string;
      onInboundTrack: (track: MediaStreamTrack) => void;
    },
  ) {
    this.pc.ontrack = (e) => {
      this.props.onInboundTrack(e.track);
    };
    this.datachannel = this.pc.createDataChannel("oai-events");
  }

  private async init() {
    this.pc.addTrack(this.outboundTrack);

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-mini-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    } as const;
    await this.pc.setRemoteDescription(answer);
  }
}
