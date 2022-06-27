import { FreeQueue } from "./index.mjs";

window.FreeQueue = FreeQueue;

const init = () => {
    Module.callMain();

    let fqPointer = Module._getFreeQueue();

    let get_free_queue_pointers = Module.cwrap("get_free_queue_pointers", "number", ["number", "string"]);

    let bufferLengthPointer = get_free_queue_pointers(fqPointer, "bufferLength");

    let channelCountPointer = get_free_queue_pointers(fqPointer, "channelCount");

    let statePointer = get_free_queue_pointers(fqPointer, "state");

    let channelsPointer = get_free_queue_pointers(fqPointer, "channels");



    let fq = FreeQueue.fromPointers({
        memory: Module.wasmMemory,
        bufferLengthPointer,
        channelCountPointer,
        statePointer,
        channelsPointer
    })
    console.log(fq)
    window.fq = fq;
}

window.Module = {
    onRuntimeInitialized: init
};
