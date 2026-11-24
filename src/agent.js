import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {extract} from './core.js';
import {mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Deterministic agent: structured meeting notes, no LLM or external account.
const dir=await mkdtemp(join(tmpdir(),'sheets-demo-'));const file=join(dir,'demo.json');await copyFile(new URL('../data/demo.json',import.meta.url),file);
const client=new Client({name:'demo-agent',version:'0.1.0'});const transport=new StdioClientTransport({command:process.execPath,args:[new URL('./server.js',import.meta.url).pathname],env:{...process.env,SHEETS_MODE:'mock',DEMO_FILE:file,ALLOW_WRITE:process.argv.includes('--approve')?'true':'false'}});
try{await client.connect(transport);console.log('Existing:',await client.callTool({name:'sheets_read',arguments:{}}));for(const row of extract('Demo Retail | Send weekly report | Sam | 2026-12-02')){const preview=await client.callTool({name:'sheets_preview',arguments:{row}});console.log('Preview:',preview);if(process.argv.includes('--approve')&&!preview.isError)console.log('Append:',await client.callTool({name:'sheets_append',arguments:{row}}));}console.log('Final:',await client.callTool({name:'sheets_read',arguments:{}}));}finally{await client.close();await rm(dir,{recursive:true,force:true});}
