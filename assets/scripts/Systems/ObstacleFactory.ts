import { ObstacleType } from '../Models/ObstacleModel';
import { PoolKey } from './PoolingSystem';

/** A single placement within a group, relative to the group's origin point. */
export interface ObstaclePlacement {
    type: ObstacleType;
    dx:   number;
    dy:   number;
}

/** A logical "group" of obstacles spawned together (one vine cluster, one rock pair, ...). */
export interface ObstacleGroup {
    label: string;
    width: number;          // approximate horizontal footprint (used for spacing)
    anchor: ObstacleAnchor; // tells the spawner where vertically to place this group
    placements: ObstaclePlacement[];
}

/** Vertical attachment point. Spawner converts this into a real Y using Collider_Top/Collider_Bottom. */
export const enum ObstacleAnchor {
    Ground   = 'ground',   // sits on the floor (Collider_Bottom)
    Ceiling  = 'ceiling',  // hangs from the top (Collider_Top)
    AirLow   = 'airLow',   // floats slightly above ground
}

/** Map of obstacle type → pool key. Single source of truth for spawn-side wiring. */
export const OBSTACLE_POOL_KEYS: Record<ObstacleType, PoolKey> = {
    [ObstacleType.Ghost]:   PoolKey.ObstacleGhost,
    [ObstacleType.Barrel]:  PoolKey.ObstacleBarrel,
    [ObstacleType.Plant]:   PoolKey.ObstaclePlant,
    [ObstacleType.Rock]:    PoolKey.ObstacleRock,
    [ObstacleType.Spider]:  PoolKey.ObstacleSpider,
    [ObstacleType.Vine_01]: PoolKey.ObstacleVine_01,
    [ObstacleType.Vine_02]: PoolKey.ObstacleVine_02,
    [ObstacleType.Vine_03]: PoolKey.ObstacleVine_03,
};

/**
 * Each obstacle "kind" has its own builder. Kinds describe HOW to spawn
 * (single vs. cluster) independent of the prefab. Vertical attachment is
 * declared by the kind's anchor and applied uniformly by the spawner.
 *
 * To extend: add a new builder to BUILDERS, then list its key in PICKABLE_KINDS.
 */
export const enum ObstacleKind {
    Ghost       = 'Ghost',
    Plant       = 'Plant',
    Spider      = 'Spider',
    Barrel      = 'Barrel',
    RockGroup   = 'RockGroup',
    VineCluster = 'VineCluster',
}

type GroupBuilder = () => ObstacleGroup;

const BUILDERS: Record<ObstacleKind, GroupBuilder> = {

    [ObstacleKind.Ghost]: () => ({
        label: 'ghost',
        width: 140,
        anchor: ObstacleAnchor.AirLow,
        placements: [{ type: ObstacleType.Ghost, dx: 0, dy: 0 }],
    }),

    [ObstacleKind.Plant]: () => ({
        label: 'plant',
        width: 100,
        anchor: ObstacleAnchor.Ground,
        placements: [{ type: ObstacleType.Plant, dx: 0, dy: 0 }],
    }),

    [ObstacleKind.Spider]: () => ({
        label: 'spider',
        width: 100,
        anchor: ObstacleAnchor.Ceiling,
        placements: [{ type: ObstacleType.Spider, dx: 0, dy: 0 }],
    }),

    // Single barrel — easier than a stack and fairer to the player.
    [ObstacleKind.Barrel]: () => ({
        label: 'barrel',
        width: 110,
        anchor: ObstacleAnchor.Ground,
        placements: [{ type: ObstacleType.Barrel, dx: 0, dy: 0 }],
    }),

    [ObstacleKind.RockGroup]: () => {
        const count = 2 + Math.floor(Math.random() * 2); // 2..3
        const spacing = 70;
        const placements: ObstaclePlacement[] = [];
        const startX = -((count - 1) * spacing) * 0.5;
        for (let i = 0; i < count; i++) {
            placements.push({
                type: ObstacleType.Rock,
                dx: startX + i * spacing + (Math.random() - 0.5) * 15,
                dy: (Math.random() - 0.5) * 8,  // tiny vertical jitter, still on ground
            });
        }
        return { label: 'rock-group', width: count * spacing + 50, anchor: ObstacleAnchor.Ground, placements };
    },

    [ObstacleKind.VineCluster]: () => {
        const count = 3 + Math.floor(Math.random() * 3); // 3..5
        const variants = [ObstacleType.Vine_01, ObstacleType.Vine_02, ObstacleType.Vine_03];
        const placements: ObstaclePlacement[] = [];
        const spacing = 55;
        const startX = -((count - 1) * spacing) * 0.5;
        for (let i = 0; i < count; i++) {
            const type = variants[Math.floor(Math.random() * variants.length)];
            placements.push({
                type,
                dx: startX + i * spacing + (Math.random() - 0.5) * 12,
                // Slight downward jitter so vines look uneven, but hang from same top anchor.
                dy: -Math.random() * 30,
            });
        }
        return { label: 'vine-cluster', width: count * spacing + 40, anchor: ObstacleAnchor.Ceiling, placements };
    },
};

/** Kinds eligible for random selection. Repetition = weight. */
const PICKABLE_KINDS: ObstacleKind[] = [
    ObstacleKind.Ghost,
    ObstacleKind.Plant,
    ObstacleKind.Spider,
    ObstacleKind.Barrel,
    ObstacleKind.RockGroup,
    ObstacleKind.VineCluster,
];

export class ObstacleFactory {
    static build(kind: ObstacleKind): ObstacleGroup {
        return BUILDERS[kind]();
    }

    static buildRandom(): ObstacleGroup {
        const kind = PICKABLE_KINDS[Math.floor(Math.random() * PICKABLE_KINDS.length)];
        return BUILDERS[kind]();
    }

    static buildRandomExcluding(excluded: Set<ObstacleKind>): ObstacleGroup | null {
        const eligible = PICKABLE_KINDS.filter(k => !excluded.has(k));
        if (eligible.length === 0) return null;
        const kind = eligible[Math.floor(Math.random() * eligible.length)];
        return BUILDERS[kind]();
    }
}
