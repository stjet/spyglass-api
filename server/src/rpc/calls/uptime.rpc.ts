import { NANO_CLIENT } from '@app/config';
import { UptimeResponse } from '@jetstream0/nano-node-rpc-patched';

export const uptimeRpc = async (): Promise<UptimeResponse> =>
    NANO_CLIENT.uptime()
        .then((data: UptimeResponse) => Promise.resolve(data))
        .catch((err) => Promise.reject(err));
