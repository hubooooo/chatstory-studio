import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Phone } from "../components/phone/Phone";
import { Conversation } from "../components/chat/Conversation";
import type { Story } from "../schema/story";
import { timeline } from "../timeline";
import { Fragment } from "react";
export function Video({ story }: { story: Story }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Phone story={story}>
        <Conversation story={story} frame={frame} />
      </Phone>
      <Audio src={staticFile("assets/none.wav")} loop volume={1} />
      {!story.audio_settings.muted &&
        timeline(story).map((e) => (
          <Fragment key={e.message.id}>
            {e.message.sound_effect !== "none" && (
              <Sequence from={e.start} durationInFrames={4} layout="none">
                <Audio
                  src={staticFile(`assets/${e.message.sound_effect}.wav`)}
                  volume={story.audio_settings.effects_volume}
                />
              </Sequence>
            )}{" "}
            {e.message.audio_path && e.message.voice_mode === "auto" && (
              <Sequence
                from={e.start}
                durationInFrames={Math.max(1, e.voiceFrames)}
                layout="none"
              >
                <Audio
                  src={staticFile(e.message.audio_path)}
                  volume={story.voice_settings.volume}
                />
              </Sequence>
            )}
          </Fragment>
        ))}
    </AbsoluteFill>
  );
}
