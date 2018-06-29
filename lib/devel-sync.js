"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const Path = require("path");
const local_params_1 = require("./local-params");
async function copy(source, target) {
    console.log('COPY', source, target);
    try {
        await fs.copy(source, target, { recursive: true });
        console.log('COPIED OK!', source, target);
    }
    catch (err) {
        console.log('ERROR copying', source, target);
        console.log(err);
    }
}
var copyChain = Promise.resolve();
function addToCopyChain(source, target) {
    copyChain = copyChain.then(function () {
        return copy(source, target);
    });
}
function sync() {
    local_params_1.params.sources.forEach(function (pathOrObject) {
        let { path, dest } = typeof pathOrObject === 'string' ? {
            path: pathOrObject,
            dest: pathOrObject
        } : pathOrObject;
        var sourcePath = Path.join(local_params_1.params.rootSource, path);
        console.log('watching', path, dest ? '(to:' + dest + ')' : '', sourcePath, Path.resolve(sourcePath));
        fs.watch(sourcePath, { recursive: true }, function (event, fileName) {
            console.log(new Date().toLocaleString(), event, fileName);
            local_params_1.params.targets.forEach(function (target) {
                if (fileName && target != pathOrObject && !local_params_1.params.exclude.some(prefix => fileName.startsWith(prefix))) {
                    var targetPath;
                    if (typeof target === "string") {
                        targetPath = Path.join(local_params_1.params.rootTarget, target, 'node_modules', dest, fileName);
                    }
                    else {
                        targetPath = Path.join(target.absolute, 'node_modules', dest, fileName);
                    }
                    addToCopyChain(Path.join(sourcePath, fileName), targetPath);
                }
            });
        });
    });
}
sync();
//# sourceMappingURL=devel-sync.js.map