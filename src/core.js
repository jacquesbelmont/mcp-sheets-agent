import {readFile,writeFile} from 'node:fs/promises';
export const header=['Client','Task','Owner','Due','Status'];
export function validate(row){if(!Array.isArray(row)||row.length!==5||row.some(x=>typeof x!=='string'||!x.trim()||x.length>500)||!/^\d{4}-\d{2}-\d{2}$/.test(row[3])||!['Open','Done'].includes(row[4]))throw Error('Invalid task row');return row.map(x=>x.trim());}
export function mockStore(path){return {read:async()=>JSON.parse(await readFile(path,'utf8')),append:async row=>{const rows=JSON.parse(await readFile(path,'utf8'));rows.push(validate(row));await writeFile(path,JSON.stringify(rows,null,2));return {added:1};}};}
export function extract(text){const lines=text.split('\n').filter(x=>x.trim());return lines.map(line=>validate([...line.split('|').map(x=>x.trim()),'Open']));}
export async function execute(store, name, args={}, allowWrite=false){if(name==='sheets_read')return {rows:await store.read()};if(name==='sheets_preview')return {row:validate(args.row),written:false};if(name==='sheets_append'){if(!allowWrite)throw Error('Writes disabled');return store.append(validate(args.row));}throw Error('Unknown tool');}
