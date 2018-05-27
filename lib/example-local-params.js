"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = {
    rootSource: '..',
    rootTarget: '..',
    sources: [
        { path: 'types.d.ts/modules', dest: '@types' },
        'backend-plus',
        'bas-ope',
    ],
    targets: [
        'rel-enc',
        'meta-enc',
    ],
    exclude: [
        '.',
        'node_modules'
    ]
};
//# sourceMappingURL=example-local-params.js.map