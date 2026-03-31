import { AccountInfoResponse } from '@jetstream0/nano-node-rpc-patched';
import { NANO_CLIENT } from '@app/config';

export const accountInfoRpc = async (address): Promise<AccountInfoResponse> =>
    NANO_CLIENT.account_info(address, {
        representative: true,
        pending: true,
        weight: true,
        // @ts-ignore
        receivable: true,
    })
        .then((accountInfo: AccountInfoResponse) => Promise.resolve(accountInfo))
        .catch((err) => Promise.reject(err));
