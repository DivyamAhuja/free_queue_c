#include <math.h>

#define FREE_QUEUE_IMPL
#include "free_queue.h"

struct FreeQueue *fq;

EMSCRIPTEN_KEEPALIVE void *getFreeQueue()
{
    return fq;
}

uint32_t sample = 0;
const uint32_t frequency = 440;

float buffer[128];
float *input[] = {buffer};

EMSCRIPTEN_KEEPALIVE bool process()
{
    for (int i = 0; i < 128; i++)
    {
        buffer[i] = sin(2.0 * 3.1415 * frequency * sample / 48000);
        sample++;
        if (sample >= 48000)
            sample = 0;
    }
    return free_queue_push(fq, input, 128);
}

int main(int argc, char **argv)
{
    fq = create_free_queue(1024, 1);
    return 0;
}
