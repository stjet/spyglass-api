import { NANO_CLIENT } from '@app/config';
import { BlockCountResponse } from '@jetstream0/nano-node-rpc-patched';

export const blockCountRpc = async (): Promise<BlockCountResponse> =>
    NANO_CLIENT.block_count()
        .then((data: BlockCountResponse) => Promise.resolve(data))
        .catch((err) => Promise.reject(err));
