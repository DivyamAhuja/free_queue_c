class FreeQueue {
    constructor(size, channelCount = 1) {
        this.states = new Uint32Array(new SharedArrayBuffer(Object.keys(FreeQueue.States).length * Uint32Array.BYTES_PER_ELEMENT));
        this.bufferLength = size + 1;
        this.channelCount = channelCount;
        this.channels = [];
        for (let i = 0; i < channelCount; i++) {
            this.channels.push(new Float32Array(new SharedArrayBuffer(this.bufferLength * Float32Array.BYTES_PER_ELEMENT)));
        }
    }
    static fromPointers(fqPointers) {
        let fq = new FreeQueue(0, 0);
        let HEAPU32 = new Uint32Array(fqPointers.memory.buffer);
        let HEAPF32 = new Float32Array(fqPointers.memory.buffer);
        let bufferLength = HEAPU32[fqPointers.bufferLengthPointer / 4];
        let channelCount = HEAPU32[fqPointers.channelCountPointer / 4];
        let states = HEAPU32.subarray(HEAPU32[fqPointers.statePointer / 4] / 4, HEAPU32[fqPointers.statePointer / 4] / 4 + 2);
        let channels = [];
        for (let i = 0; i < channelCount; i++) {
            channels.push(HEAPF32.subarray(HEAPU32[HEAPU32[fqPointers.channelsPointer / 4] / 4 + i] / 4, HEAPU32[HEAPU32[fqPointers.channelsPointer / 4] / 4 + i] / 4 +
                bufferLength));
        }
        fq.bufferLength = bufferLength;
        fq.channelCount = channelCount;
        fq.states = states;
        fq.channels = channels;
        return fq;
    }
    push(input, blockLength) {
        const currentRead = Atomics.load(this.states, FreeQueue.States.READ);
        const currentWrite = Atomics.load(this.states, FreeQueue.States.WRITE);
        if (this._getAvailableWrite(currentRead, currentWrite) < blockLength) {
            return false;
        }
        let nextWrite = currentWrite + blockLength;
        if (this.bufferLength < nextWrite) {
            nextWrite -= this.bufferLength;
            for (let channel = 0; channel < this.channelCount; channel++) {
                const blockA = this.channels[channel].subarray(currentWrite);
                const blockB = this.channels[channel].subarray(0, nextWrite);
                blockA.set(input[channel].subarray(0, blockA.length));
                blockB.set(input[channel].subarray(blockA.length, blockLength - blockA.length + 1));
            }
        }
        else {
            for (let channel = 0; channel < this.channelCount; channel++) {
                this.channels[channel]
                    .subarray(currentWrite, nextWrite)
                    .set(input[channel].subarray(0, blockLength));
            }
            if (nextWrite === this.bufferLength)
                nextWrite = 0;
        }
        Atomics.store(this.states, FreeQueue.States.WRITE, nextWrite);
        return true;
    }
    pull(output, blockLength) {
        const currentRead = Atomics.load(this.states, FreeQueue.States.READ);
        const currentWrite = Atomics.load(this.states, FreeQueue.States.WRITE);
        if (this._getAvailableRead(currentRead, currentWrite) < blockLength) {
            return false;
        }
        let nextRead = currentRead + blockLength;
        if (this.bufferLength < nextRead) {
            nextRead -= this.bufferLength;
            for (let channel = 0; channel < this.channelCount; channel++) {
                const blockA = this.channels[channel].subarray(currentRead);
                const blockB = this.channels[channel].subarray(0, nextRead);
                output[channel].set(blockA);
                output[channel].set(blockB, blockA.length);
            }
        }
        else {
            for (let channel = 0; channel < this.channelCount; ++channel) {
                output[channel].set(this.channels[channel].subarray(currentRead, nextRead));
            }
            if (nextRead === this.bufferLength) {
                nextRead = 0;
            }
        }
        Atomics.store(this.states, FreeQueue.States.READ, nextRead);
        return true;
    }
    print() {
        const currentRead = Atomics.load(this.states, FreeQueue.States.READ);
        const currentWrite = Atomics.load(this.states, FreeQueue.States.WRITE);
        console.log(this, {
            availableRead: this._getAvailableRead(currentRead, currentWrite),
            availableWrite: this._getAvailableWrite(currentRead, currentWrite),
        });
    }
    getBufferLength() {
        return this.bufferLength - 1;
    }
    _getAvailableWrite(readIndex, writeIndex) {
        if (writeIndex >= readIndex)
            return this.bufferLength - writeIndex + readIndex - 1;
        return readIndex - writeIndex - 1;
    }
    _getAvailableRead(readIndex, writeIndex) {
        if (writeIndex >= readIndex)
            return writeIndex - readIndex;
        return writeIndex + this.bufferLength - readIndex;
    }
    _reset() {
        for (let channel = 0; channel < this.channelCount; channel++) {
            this.channels[channel].fill(0);
        }
        Atomics.store(this.states, FreeQueue.States.READ, 0);
        Atomics.store(this.states, FreeQueue.States.WRITE, 0);
    }
}
FreeQueue.States = {
    READ: 0,
    WRITE: 1,
};

export { FreeQueue };
//# sourceMappingURL=index.mjs.map
