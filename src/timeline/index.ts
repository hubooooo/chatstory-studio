import type {Story} from '../schema/story';
export const FPS=30;
export const frameAt=(ms:number)=>Math.round(ms*FPS/1000);
export function timeline(story:Story){return story.messages.map((m,index)=>({message:m,index,start:frameAt(story.render_settings.lead_in_ms+m.appear_at_ms+m.wait_before_ms),animation:Math.max(1,frameAt(m.animation_duration_ms)),voiceFrames:frameAt(m.audio_duration_ms??0)})).sort((a,b)=>a.start-b.start||a.index-b.index);}
export function durationFrames(s:Story){return Math.max(30,...timeline(s).map(e=>e.start+Math.max(e.animation,e.voiceFrames)+frameAt(s.render_settings.tail_ms)));}
export function rowHeight(m:Story['messages'][number]){if(['time','system','recall'].includes(m.type))return 75;if(m.type==='image')return 410;return Math.max(160,100+Math.ceil(m.text.length/17)*49);}
export function scrollAt(s:Story,frame:number){let used=0,target=0,previous=0,start=0;for(const e of timeline(s)){if(e.start>frame)break;used+=rowHeight(e.message);if(e.message.auto_scroll){previous=target;target=Math.max(0,used-1260);start=e.start;}}const t=Math.min(1,Math.max(0,(frame-start)/12));return previous+(target-previous)*(1-Math.pow(1-t,3));}
