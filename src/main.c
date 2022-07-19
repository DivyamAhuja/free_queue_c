#include <math.h>

#define FREE_QUEUE_IMPL
#include "free_queue.h"

struct FreeQueue *fq;

EMSCRIPTEN_KEEPALIVE void *getFreeQueue()
{
    return fq;
}

uint32_t sample = 0;
const float frequency = 440.0;

float buffer[1024];
float *input[] = {buffer};

EMSCRIPTEN_KEEPALIVE bool process()
{
    for (int i = 0; i < 1024; i++)
    {
        buffer[i] = sin(2.0 * 3.1415 * frequency * sample / 48000);
        sample++;
        if (sample >= 48000)
            sample = 0;
    }
    return free_queue_push(fq, input, 1024);
}

int main(int argc, char **argv)
{
    fq = create_free_queue(4096, 1);
    return 0;
}
