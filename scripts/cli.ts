import fs from 'node:fs/promises';
import path from 'node:path';
import {batch,renderStory} from './pipeline';
import {prepareStory} from './media';
import {parseStory,storySchema} from '../src/schema/story';
import {z} from 'zod';
const [command,...args]=process.argv.slice(2);const opt=(key:string,fallback='')=>args[args.indexOf(key)+1]||fallback;
try{if(command==='render'){const input=opt('--input','examples/demo-a.json');await renderStory(JSON.parse(await fs.readFile(input,'utf8')),path.resolve(opt('--output','outputs/demo.mp4')),p=>console.log(`渲染 ${p}%`));}else if(command==='batch'){const r=await batch(opt('--input-dir','examples'),opt('--output-dir','outputs'));console.log(JSON.stringify(r,null,2));if(r.some(x=>!x.ok))process.exitCode=1;}else if(command==='tts'){const file=opt('--input','examples/demo-b.json');const s=await prepareStory(parseStory(JSON.parse(await fs.readFile(file,'utf8'))));await fs.writeFile(file,JSON.stringify(s,null,2));console.log('语音生成并探测完成');}else if(command==='schema'){await fs.writeFile('src/schema/story.schema.json',JSON.stringify(z.toJSONSchema(storySchema),null,2));}else throw new Error('使用 render / batch / tts');}catch(e){console.error(String(e));process.exitCode=1;}
