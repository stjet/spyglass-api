import { AccountRepresentativeResponse } from '@jetstream0/nano-node-rpc-patched';
import { NANO_CLIENT } from '@app/config';

export const accountRepresentativeRpc = async (addr: string): Promise<AccountRepresentativeResponse> =>
    NANO_CLIENT.account_representative(addr)
        .then((response: AccountRepresentativeResponse) => Promise.resolve(response))
        .catch((err) => Promise.reject(err));
