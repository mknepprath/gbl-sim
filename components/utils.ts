import GAME_MASTER from "../gamemaster.json";
import KANTO from "../kanto.json";

export const TURN_MS = 500;

export function getPokemonBySpeciesId(speciesId: string): Pokemon {
  const pokemon: PokemonKanto = KANTO.find((p) => p.speciesId === speciesId)!;
  const pokemonMeta: PokemonMaster = GAME_MASTER.pokemon.find(
    (p) => p.speciesId === speciesId
  )!;
  const fastMove: MoveMaster = GAME_MASTER.moves.find(
    (m) => m.moveId === pokemon.moveset[0]
  )!;
  const chargedMove1: MoveMaster = GAME_MASTER.moves.find(
    (m) => m.moveId === pokemon.moveset[1]
  )!;
  const chargedMove2: MoveMaster = GAME_MASTER.moves.find(
    (m) => m.moveId === pokemon.moveset[2]
  )!;

  return {
    id: pokemonMeta.dex,
    name: pokemonMeta.speciesName,
    fastMove: {
      name: fastMove.name,
      energy: fastMove.energyGain,
      turns: fastMove.cooldown / TURN_MS,
      type: "fast" as FastMove["type"],
    },
    chargedMoves: [
      {
        name: chargedMove1.name,
        energy: chargedMove1.energy,
        type: "charged" as ChargedMove["type"],
      },
      {
        name: chargedMove2.name,
        energy: chargedMove2.energy,
        type: "charged" as ChargedMove["type"],
      },
    ],
    speciesId,
  };
}
