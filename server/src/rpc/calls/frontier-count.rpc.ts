import { FrontierCountResponse } from '@jetstream0/nano-node-rpc-patched';
import { NANO_CLIENT } from '@app/config';

export const frontierCountRpc = async (): Promise<FrontierCountResponse> =>
    NANO_CLIENT.frontier_count()
        .then((response: FrontierCountResponse) => Promise.resolve(response))
        .catch((err) => Promise.reject(err));
