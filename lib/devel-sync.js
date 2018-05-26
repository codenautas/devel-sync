"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const Path = require("path");
const local_params_1 = require("./local-params");
function copy(source, target) {
    console.log('COPY', source, target);
    return fs.copy(source, target, { recursive: true }).catch(function (err) {
        console.log('ERROR copying', source, target);
        console.log(err);
    });
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
            dest: ''
        } : pathOrObject;
        var sourcePath = Path.join(local_params_1.params.rootSource, path);
        console.log('watching', path, dest ? '(to:' + dest + ')' : '', sourcePath, Path.resolve(sourcePath));
        fs.watch(sourcePath, { recursive: true }, function (event, fileName) {
            console.log(new Date().toLocaleString(), event, fileName);
            local_params_1.params.targets.forEach(function (target) {
                addToCopyChain(Path.join(sourcePath, fileName), Path.join(local_params_1.params.rootTarget, target, 'node_modules', dest, fileName));
            });
        });
    });
}
sync();
//# sourceMappingURL=devel-sync.js.map