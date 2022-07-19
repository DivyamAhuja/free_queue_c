let worker = new Worker(new URL('./worker.js', import.meta.url), { type: "module" });


const toogle_button = document.getElementById('toogle');
let audioContext;
let playing = false;

worker.onmessage = (msg) => {
    const { fq, state } = msg.data;
    toogle_button.onclick = async () => {
        if (audioContext === undefined) {
            audioContext = new AudioContext();
            await audioContext.audioWorklet.addModule(new URL('./sink_processor.js', import.meta.url));
            const sink_processor = new AudioWorkletNode(audioContext, 'sink_processor', {
                processorOptions: { fq, state }
            })
            sink_processor.connect(audioContext.destination);
            playing = true;
        } else {
            if (playing) {
                audioContext.suspend();
                playing = false;
            } else {
                audioContext.resume();
                playing = true;
            }
        }
    }
}
worker.onerror = (error) => console.log(error);

