import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import {mockStore,execute} from './core.js';
const live=process.env.SHEETS_MODE==='google';
const write=process.env.ALLOW_WRITE==='true';
const store=live?(await import('./google.js')).googleStore({id:process.env.SPREADSHEET_ID,allowWrite:write}):mockStore(process.env.DEMO_FILE||new URL('../data/demo.json',import.meta.url));
const server=new McpServer({name:'mcp-sheets-agent',version:'0.1.0'});
const row=z.array(z.string()).length(5);
for(const [name,description,schema] of [['sheets_read','Read task rows',{}],['sheets_preview','Validate proposed task without writing',{row}],['sheets_append','Append one task; requires write-enabled server',{row}]]){
 if(name==='sheets_append'&&!write)continue;
 server.tool(name,description,schema,async args=>{try{return {content:[{type:'text',text:JSON.stringify(await execute(store,name,args,write))}]};}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}});
}
await server.connect(new StdioServerTransport());
