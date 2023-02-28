# mkdir _build

npx tsc --strict \
        --module commonjs \
        --target es6 \
        --outDir _build \
        --watch \
        src/compiler

# rm -rf _build