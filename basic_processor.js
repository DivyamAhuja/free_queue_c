import { FreeQueue } from './index.mjs';

class BasicProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        console.log(options)
        this.fq = options.processorOptions.fq;
        this.outbuf = options.processorOptions.outbuf;
        Object.setPrototypeOf(this.fq, FreeQueue.prototype)
    }

    process(inputs, outputs) {
        const output_buffer = outputs[0][0];
        
        
        const didPull = this.fq.pull(output_buffer, 128);
        
        return true;
    }

}

registerProcessor('basic-processor', BasicProcessor);