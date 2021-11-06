interface Rated {
  opponent: string;
  rating: number;
  opRating?: number;
}

interface Move {
  moveId: string;
  uses: number;
}

interface Moves {
  fastMoves: Move[];
  chargedMoves: Move[];
}

interface PokemonKanto {
  counters: Rated[];
  matchups: Rated[];
  moves: Moves;
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId: string;
  speciesName: string;
}

interface PokemonMaster {
  baseStats: { atk: number; def: number; hp: number };
  buddyDistance?: number;
  chargedMoves: string[];
  defaultIVs: {
    cp500: number[];
    cp1500: number[];
    cp2500: number[];
    cp2500l40?: number[];
  };
  searchPriority?: number;
  dex: number;
  eliteMoves?: string[];
  fastMoves: string[];
  level25CP?: number;
  levelFloor?: number;
  released?: boolean;
  speciesId: string;
  speciesName: string;
  tags?: string[];
  thirdMoveCost?: number | boolean;
  types: string[];
}

interface MoveMaster {
  archetype?: string;
  cooldown: number;
  energy: number;
  energyGain: number;
  moveId: string;
  name: string;
  power: number;
  type: string;
}

interface FastMove {
  name: string;
  energy: number;
  turns: number;
  type: "fast";
}

interface ChargedMove {
  name: string;
  energy: number;
  type: "charged";
}

interface Pokemon {
  id: number;
  name: string;
  fastMove: FastMove;
  chargedMoves: ChargedMove[];
}
