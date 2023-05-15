import * as fs from "fs/promises"
import * as Path from "path"

import {params} from "./local-params"

import { expected } from "cast-error"

type RelPathString = string;
type PathInfo = RelPathString|{absolute:string};

type Params = {
    rootSource:RelPathString,
    rootTarget:RelPathString,
    sources:(RelPathString|{path:RelPathString, dest:RelPathString})[],
    targets:PathInfo[],
    exclude:RelPathString[]
}

async function copy(source:string,target:string):Promise<void>{
    console.log('COPY',source,target)
    try{
        await fs.cp(source,target,{recursive:true});
        console.log('COPIED OK!',source,target)
    }catch(err){
        console.log('ERROR copying',source,target)
        console.log(err);
    }
}

var copyChain=Promise.resolve();

var pendingTasks = [] as {source:string, target:string}[]

function sleep(ms:number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function addToCopyChain(source:string,target:string){
    if (!pendingTasks.find(p => p.source == source && p.target == target)) {
        pendingTasks.push({source, target})
    }
    copyChain=copyChain.then(async function(){
        await sleep(100);
        while (pendingTasks.length) {
            const {source, target} = pendingTasks.shift();
            await copy(source,target)    
        }
    });
}

function sync(params:Params){
    params.sources.forEach(async function(pathOrObject){
        let {path, dest}=typeof pathOrObject === 'string'?{
            path:pathOrObject,
            dest:pathOrObject
        }:pathOrObject;
        var sourcePath=Path.join(params.rootSource,path);
        try {
            await fs.access(Path.join(sourcePath,'dist'));
            // No access, all ok!
            sourcePath = Path.join(sourcePath, 'dist');
            dest= Path.join(dest, 'dist');
        } catch(err) {
            var error = expected(err)
            if (error.code != 'ENOENT') {
                throw err
            }
        }
        console.log('watching',path,dest?'(to:'+dest+')':'',sourcePath, Path.resolve(sourcePath))
        const watcher = fs.watch(sourcePath, {recursive:true})
        for await (const event of watcher){
            const {filename} = event;
            console.log(new Date().toLocaleString(), event);
            params.targets.forEach(function(target){
                if(filename && target!=pathOrObject && !params.exclude.some(prefix=>filename.startsWith(prefix))){
                    var targetPath = typeof target==="string"?Path.join(params.rootTarget,target):target.absolute;
                    targetPath = Path.join(targetPath, 'node_modules', dest, filename);
                    addToCopyChain(Path.join(sourcePath,filename),targetPath)
                }
            });
        }
    })
}

sync(params);