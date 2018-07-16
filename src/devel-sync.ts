import * as fs from "fs-extra"
import * as Path from "path"

import {params} from "./local-params"

type RelPathString = string;
type PathInfo = RelPathString|{absolute:string};

type Params = {
    rootSource:RelPathString,
    rootTarget:RelPathString,
    sources:RelPathString[],
    targets:PathInfo[],
    exclude:RelPathString[]
}

async function copy(source:string,target:string):Promise<void>{
    console.log('COPY',source,target)
    try{
        await fs.copy(source,target,{recursive:true});
        console.log('COPIED OK!',source,target)
    }catch(err){
        console.log('ERROR copying',source,target)
        console.log(err);
    }
}

var copyChain=Promise.resolve();

function addToCopyChain(source:string,target:string){
    copyChain=copyChain.then(function(){
        return copy(source,target)
    });
}

function sync(params:Params){
    params.sources.forEach(function(pathOrObject){
        let {path, dest}=typeof pathOrObject === 'string'?{
            path:pathOrObject,
            dest:pathOrObject
        }:pathOrObject;
        var sourcePath=Path.join(params.rootSource,path);
        console.log('watching',path,dest?'(to:'+dest+')':'',sourcePath, Path.resolve(sourcePath))
        fs.watch(sourcePath, {recursive:true}, function(event, fileName){
            console.log(new Date().toLocaleString(), event, fileName);
            params.targets.forEach(function(target){
                if(fileName && target!=pathOrObject && !params.exclude.some(prefix=>fileName.startsWith(prefix))){
                    var targetPath
                    if(typeof target==="string"){
                        targetPath=Path.join(params.rootTarget,target,'node_modules',dest,fileName)
                    }else{
                        targetPath=Path.join(target.absolute,'node_modules',dest,fileName);
                    }
                    addToCopyChain(Path.join(sourcePath,fileName),targetPath)
                }
            });
        })
    })
}

sync(params);