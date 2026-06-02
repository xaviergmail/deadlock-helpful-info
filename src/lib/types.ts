// Skeleton types matching api.deadlock-api.com response shapes.
// Concrete data fetching + rendering belongs in a follow-up plan.

export type SlotType = 'weapon' | 'vitality' | 'spirit';

export interface HeroImages {
  readonly portrait?: string;
  readonly card?: string;
  readonly icon?: string;
  readonly minimap?: string;
}

export interface Ability {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly cooldown?: number;
  readonly heroId?: number;
}

export interface Hero {
  readonly id: number;
  readonly name: string;
  readonly className?: string;
  readonly images: HeroImages;
  readonly abilities: ReadonlyArray<Ability>;
}

export interface Item {
  readonly id: number;
  readonly name: string;
  readonly cost?: number;
  readonly tier?: number;
  readonly slot?: SlotType;
  readonly imageUrl?: string;
}

export interface HeroStats {
  readonly heroId: number;
  readonly winRate: number;
  readonly pickRate: number;
  readonly rank?: string;
  readonly patch?: string;
}
