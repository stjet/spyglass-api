import { AccountBalanceResponse } from '@jetstream0/nano-node-rpc-patched';
import { NANO_CLIENT } from '@app/config';

export const accountBalanceRpc = async (address): Promise<AccountBalanceResponse> =>
    NANO_CLIENT.account_balance(address)
        .then((accountBalance: AccountBalanceResponse) => Promise.resolve(accountBalance))
        .catch((err) => Promise.reject(err));
