rm -rf _build/*

npx tsc --strict \
        --module commonjs \
        --target es6 \
        --outDir _build \
        src/compiler

npx tsc --strict \
        --module commonjs \
        --target es6 \
        --outDir _build \
        tests-e2e/test

cp tests-e2e/*.baseline _build
cd _build

node test.js