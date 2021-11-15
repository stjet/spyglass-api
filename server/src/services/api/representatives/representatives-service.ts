import { NANO_CLIENT } from '@app/config';
import { rawToBan } from 'banano-unit-converter';
import {
    getAliasedRepsPromise,
    getMonitoredRepsPromise,
    getOnlineRepsPromise,
    getPrincipalRequirementPromise,
    populateDelegatorsCount,
    LOG_INFO,
    getRepresentativesUptimePromise,
} from '@app/services';
import { RepresentativeDto } from '@app/types';

type RequestBody = {
    isOnline: boolean;
    isPrincipal: boolean;
    includeAlias: boolean;
    includeDelegatorCount: boolean;
    includeNodeMonitorStats: boolean;
    includeUptimeStats: boolean;
    includeUptimePings: boolean;
    minimumWeight: number;
    maximumWeight: number;
};

const DEFAULT_BODY: RequestBody = {
    isOnline: false,
    isPrincipal: false,
    includeAlias: false,
    includeDelegatorCount: false,
    includeNodeMonitorStats: false,
    includeUptimeStats: false,
    includeUptimePings: false,
    minimumWeight: 10_000,
    maximumWeight: Number.MAX_SAFE_INTEGER,
};

/**
 * Gets the top 5000 representatives & filters out smaller ones.
 */
export const getRepresentatives = async (req, res): Promise<RepresentativeDto[]> => {
    const start = LOG_INFO('Refreshing Root Reps');

    const body = req.body as RequestBody;
    if (body.includeDelegatorCount === undefined) {
        body.includeDelegatorCount = DEFAULT_BODY.includeDelegatorCount;
    }
    if (body.includeNodeMonitorStats === undefined) {
        body.includeNodeMonitorStats = DEFAULT_BODY.includeNodeMonitorStats;
    }
    if (body.includeUptimeStats === undefined) {
        body.includeUptimeStats = DEFAULT_BODY.includeUptimeStats;
    }
    if (body.isPrincipal === undefined) {
        body.isPrincipal = DEFAULT_BODY.isPrincipal;
    }
    if (body.isOnline === undefined) {
        body.isOnline = DEFAULT_BODY.isOnline;
    }
    if (body.maximumWeight === undefined) {
        body.maximumWeight = DEFAULT_BODY.maximumWeight;
    }
    if (body.minimumWeight === undefined) {
        body.minimumWeight = DEFAULT_BODY.minimumWeight;
    }
    body.minimumWeight = Math.max(body.minimumWeight, 1000);

    const rpcData = await NANO_CLIENT.representatives(5000, true);
    const repMap = new Map<string, RepresentativeDto>();

    // Filters reps by weight restrictions.
    const maxWeight = Number(body.maximumWeight);
    const minWeight = Number(body.minimumWeight);
    for (const address in rpcData.representatives) {
        const raw = rpcData.representatives[address];
        const weight = Math.round(Number(rawToBan(raw)));
        if (weight >= minWeight && weight <= maxWeight) {
            repMap.set(address, { address, weight });
        }
        // Terminates loop early; results have to be sorted by weight descending for this to work.
        if (weight <= minWeight) {
            break;
        }
    }

    // Filter map to only include Online Representatives
    if (body.isOnline) {
        const onlineReps = await getOnlineRepsPromise();
        const onlineAddresses = new Set<string>();
        onlineReps.map((rep) => onlineAddresses.add(rep));
        for (const address of repMap.keys()) {
            if (onlineAddresses.has(address)) {
                repMap.get(address).isOnline = true;
            } else {
                repMap.delete(address);
            }
        }
    }

    // Filter map to only include Principal Representatives
    if (body.isPrincipal) {
        const principalWeightRequirement = await getPrincipalRequirementPromise();
        for (const address of repMap.keys()) {
            if (repMap.get(address).weight >= principalWeightRequirement) {
                repMap.get(address).isPrincipal = true;
            } else {
                repMap.delete(address);
            }
        }
    }

    // Append delegatorsCount to each rep.
    if (body.includeDelegatorCount) {
        await populateDelegatorsCount(repMap);
    }

    // Append alias to each rep.
    if (body.includeAlias) {
        const aliasedReps = await getAliasedRepsPromise();
        for (const aliasedRep of aliasedReps) {
            const rep = repMap.get(aliasedRep.address);
            if (rep) {
                rep.alias = aliasedRep.alias;
            }
        }
    }

    // Append node monitor stats to each rep.
    if (body.includeNodeMonitorStats) {
        const monitoredReps = await getMonitoredRepsPromise();
        for (const stats of monitoredReps) {
            const rep = repMap.get(stats.address);
            stats.address = undefined;
            stats.online = undefined;
            if (rep) {
                rep.nodeMonitorStats = stats;
            }
        }
    }

    // Append uptime stats to each rep.
    if (body.includeUptimeStats) {
        const uptimeStats = await getRepresentativesUptimePromise({
            representatives: Array.from(repMap.keys()),
            includePings: body.includeUptimePings,
        });
        for (const stats of uptimeStats) {
            const rep = repMap.get(stats.address);
            stats.address = undefined;
            stats.online = undefined;
            if (rep) {
                rep.uptimeStats = stats;
            }
        }
    }

    // Construct large rep response-types dto
    const reps: RepresentativeDto[] = Array.from(repMap.values());
    res.send(reps);
    LOG_INFO('Root Reps Updated', start);
    return reps;
};
