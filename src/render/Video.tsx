import {AbsoluteFill,Audio,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {Phone} from '../components/phone/Phone';
import {Conversation} from '../components/chat/Conversation';
import type {Story} from '../schema/story';
import {timeline} from '../timeline';
export function Video({story}:{story:Story}){const frame=useCurrentFrame();return <AbsoluteFill><Phone story={story}><Conversation story={story} frame={frame}/></Phone>{!story.audio_settings.muted&&timeline(story).map(e=><Sequence key={e.message.id} from={e.start} layout="none">{e.message.sound_effect!=='none'&&<Audio src={staticFile(`assets/${e.message.sound_effect}.wav`)} volume={story.audio_settings.effects_volume}/>} {e.message.audio_path&&e.message.voice_mode==='auto'&&<Audio src={staticFile(e.message.audio_path)} volume={story.voice_settings.volume}/>}</Sequence>)}</AbsoluteFill>;}
