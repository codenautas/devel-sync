import * as fs from "fs-extra"
import * as Path from "path"

import {params} from "./local-params"

function copy(source:string,target:string):Promise<void>{
    console.log('COPY',source,target)
    return fs.copy(source,target,{recursive:true}).catch(function(err){
        console.log('ERROR copying',source,target)
        console.log(err);
    })
}

var copyChain=Promise.resolve();

function addToCopyChain(source:string,target:string){
    copyChain=copyChain.then(function(){
        return copy(source,target)
    });
}

function sync(){
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
                addToCopyChain(Path.join(sourcePath,fileName),Path.join(params.rootTarget,target,'node_modules',dest,fileName))
            });
        })
    })
}

sync();