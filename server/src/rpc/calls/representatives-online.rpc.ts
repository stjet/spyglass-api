import { RepresentativesOnlineResponse, RepresentativesOnlineWeightResponse } from '@jetstream0/nano-node-rpc-patched';
import { NANO_CLIENT } from '@app/config';

export const representativesOnlineWithWeightRpc = async (): Promise<RepresentativesOnlineWeightResponse> =>
    NANO_CLIENT.representatives_online(true)
        .then((reps: RepresentativesOnlineWeightResponse) => Promise.resolve(reps))
        .catch((err) => Promise.reject(err));

export const representativesOnlineWithoutWeightRpc = async (): Promise<RepresentativesOnlineResponse> =>
    NANO_CLIENT.representatives_online(false)
        .then((reps: RepresentativesOnlineResponse) => Promise.resolve(reps))
        .catch((err) => Promise.reject(err));
