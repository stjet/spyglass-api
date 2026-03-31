import { NANO_CLIENT } from '@app/config';
import { VersionResponse } from '@jetstream0/nano-node-rpc-patched';

export const versionRpc = async (): Promise<VersionResponse> =>
    NANO_CLIENT.version()
        .then((data: VersionResponse) => Promise.resolve(data))
        .catch((err) => Promise.reject(err));
