import {Composition,registerRoot} from 'remotion';
import {Video} from './Video';
import {durationFrames} from '../timeline';
import {parseStory} from '../schema/story';
const story=parseStory({project_id:'default',title:'聊天故事',characters:[{id:'a',name:'小林',side:'left'}],messages:[{id:'m',sender_id:'a',type:'text',text:'你好',appear_at_ms:0}]});
registerRoot(()=> <Composition id="ChatStory" component={Video} width={1080} height={1920} fps={30} durationInFrames={90} defaultProps={{story}} calculateMetadata={({props})=>({durationInFrames:durationFrames(props.story)})}/>);
