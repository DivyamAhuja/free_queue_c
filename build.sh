mkdir -p "build"
emcc src/main.c -sENVIRONMENT=worker -sMODULARIZE=1 -sEXPORT_NAME=FQC -sINVOKE_RUN=0 -pthread -sEXPORTED_RUNTIME_METHODS="['callMain','ccall', 'cwrap']" -o build/main.js