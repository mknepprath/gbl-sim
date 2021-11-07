import { useEffect, useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import type { NextPage } from "next";
import Head from "next/head";

import useInterval from "../hooks/use-interval";
import { getPokemonBySpeciesId, TURN_MS } from "../components/utils";
import KANTO from "../kanto.json";

import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Practice.module.css";

const round = (n: number) => Math.round(n * 100) / 100;

const Practice: NextPage = () => {
  const [count, setCount] = useState<number>(0);
  const [delay, setDelay] = useState<number>(TURN_MS);
  const [isPlaying, setPlaying] = useState<boolean>(false);

  const [pokemon, setPokemon] = useState<Pokemon>();
  const [opponent, setOpponent] = useState<Pokemon>();
  const [energy, setEnergy] = useState<number>(0);
  const [oppoEnergy, setOppoEnergy] = useState<number>(0);
  const [queuedMove, setQueuedMove] = useState<FastMove | ChargedMove | null>(
    null
  );

  const [hitRate, setHitRate] = useState<string[]>([]);

  useEffect(() => {
    setPokemon(getPokemonBySpeciesId("nidoqueen_shadow"));
    setOpponent(
      getPokemonBySpeciesId(
        KANTO[Math.floor(Math.random() * KANTO.length)].speciesId
      )
    );
  }, []);

  const notify = (message: string) => toast(message);

  let throwTurn = 0;
  let turnsToAlignment = 1;
  if (pokemon && opponent) {
    if (pokemon.fastMove.turns % opponent.fastMove.turns === 0) {
    } else {
      turnsToAlignment = pokemon.fastMove.turns * opponent.fastMove.turns;
      const totalMoves = Array.from(
        Array(turnsToAlignment / pokemon.fastMove.turns - 1)
      );
      const energyGivenUpPerTurn = totalMoves.map((_, index) => {
        const yourTurns = pokemon.fastMove.turns * (index + 1);
        let opponentTurns = 0;
        while (opponentTurns < yourTurns) {
          opponentTurns += opponent.fastMove.turns;
        }
        return opponentTurns - yourTurns;
      });
      const throwMove =
        energyGivenUpPerTurn.indexOf(Math.min(...energyGivenUpPerTurn)) + 1;
      throwTurn = throwMove * pokemon.fastMove.turns;
    }

    while (
      pokemon.chargedMoves[0].energy /
        (pokemon.fastMove.energy / pokemon.fastMove.turns) >
      throwTurn
    ) {
      throwTurn += turnsToAlignment;
    }
  }

  useInterval(
    () => {
      if (pokemon && opponent) {
        setCount(count + 1);

        if (count === turnsToAlignment) {
          notify("ALIGNED");
        }
        if (count === throwTurn - pokemon.fastMove.turns) {
          notify("THROW");
        }

        if (count % pokemon.fastMove.turns === 0) {
          switch (queuedMove?.type) {
            case "fast":
              setEnergy((e) => Math.min(e + pokemon.fastMove.energy, 100));
              break;
            case "charged":
              setCount(0);
              setEnergy((e) => e - queuedMove.energy);
              break;
            default:
          }
          setQueuedMove(null);
        }
        if (count % opponent.fastMove.turns === 0) {
          setOppoEnergy((e) => Math.min(e + opponent.fastMove.energy, 100));
        }
        if (throwTurn === count) {
          if (queuedMove?.type === "charged") {
            setHitRate(["GOT IT", ...hitRate]);
            notify("GOT IT");
          } else {
            setHitRate(["MISS", ...hitRate]);
            notify("MISS");
          }
          reset();
          setOpponent(
            getPokemonBySpeciesId(
              KANTO[Math.floor(Math.random() * KANTO.length)].speciesId
            )
          );
        }
      }
    },
    // Delay in milliseconds or null to stop it
    isPlaying ? delay : null
  );

  const reset = () => {
    setCount(0);
    setQueuedMove(null);
    setEnergy(0);
    setOppoEnergy(0);
  };

  return pokemon && opponent ? (
    <div className={styles.container + " " + (isPlaying ? styles.pulse : "")}>
      <Head>
        <title>Practice</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p className={styles.description}>
          Turn: <code className={styles.code}>{count}</code> Throw:{" "}
          <code
            className={
              styles.code +
              " " +
              (count < throwTurn && count >= throwTurn - pokemon.fastMove.turns
                ? styles.green
                : "")
            }
          >
            {throwTurn}
          </code>
          {!isPlaying ? (
            <>
              <button onClick={() => setPlaying(true)}>Play</button>
              <button
                onClick={() => {
                  reset();
                  setHitRate([]);
                }}
              >
                Reset
              </button>
            </>
          ) : (
            <button onClick={() => setPlaying(false)}>Stop</button>
          )}
        </p>
        {/* <small>Don&apos;t give your opponent free energy!</small> */}

        <div className={styles.grid}>
          <div className={styles.card}>
            {/* <h2>Opponent</h2> */}
            <p>{opponent.name}</p>
            <img
              style={{ objectFit: "contain" }}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${opponent.id}.png`}
            />
            <div>
              <small>
                {opponent.fastMove.name} ({opponent.fastMove.turns} turns)
              </small>
            </div>
            {/* <div className={styles.chargedMoves}>
              {opponent.chargedMoves.map((chargedMove) => (
                <button
                  className={styles.chargedMove}
                  disabled
                  key={chargedMove.name}
                  style={{
                    background: `linear-gradient(0deg, green ${
                      (oppoEnergy * 100) / chargedMove.energy
                    }%, lightgrey ${(oppoEnergy * 100) / chargedMove.energy}%)`,
                  }}
                  onClick={() => {
                    setCount(0);
                    setOppoEnergy((e) => e - chargedMove.energy);
                  }}
                >
                  {chargedMove.name} ({chargedMove.energy})
                </button>
              ))}
            </div> */}
            <div
              style={{
                height: 10,
                width: "100%",
                backgroundColor: "lightgrey",
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  height: 10,
                  width: `${oppoEnergy}%`,
                  backgroundColor: "green",
                  borderRadius: 5,
                  color: "white",
                  fontSize: 8,
                  paddingLeft: 2,
                  transition: `width ${
                    opponent.fastMove.turns * TURN_MS
                  }ms cubic-bezier(1.000, -0.125, 0.770, 0.990)`,
                }}
              >
                {round(oppoEnergy)}
              </div>
            </div>
          </div>

          <div
            className={
              styles.card +
              "  " +
              (queuedMove?.type === "charged" ? styles.chargeQueued : "")
            }
            onClick={() => {
              if (!isPlaying) setPlaying(true);
              if (!queuedMove) setQueuedMove(pokemon.fastMove);
            }}
          >
            {/* <h2>You</h2> */}
            <p>{pokemon.name}</p>
            <img
              style={{ objectFit: "contain" }}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
            />
            <div>
              <small>
                {pokemon.fastMove.name} ({pokemon.fastMove.turns} turns)
              </small>
            </div>
            <div className={styles.chargedMoves}>
              {pokemon.chargedMoves.map((chargedMove: ChargedMove) => (
                <div key={chargedMove.name}>
                  <small>
                    {chargedMove.name} ({chargedMove.energy})
                  </small>
                  <button
                    className={styles.chargedMove}
                    disabled={
                      energy < chargedMove.energy ||
                      queuedMove?.type === "charged"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!queuedMove) setQueuedMove(chargedMove);
                    }}
                    style={{
                      background: `linear-gradient(0deg, green ${
                        (energy * 100) / chargedMove.energy
                      }%, lightgrey ${(energy * 100) / chargedMove.energy}%)`,
                      border:
                        energy < chargedMove.energy
                          ? "0px solid white"
                          : "4px solid white",
                      opacity:
                        energy < chargedMove.energy ||
                        queuedMove?.type === "charged"
                          ? 0.3
                          : 1,
                      pointerEvents:
                        energy < chargedMove.energy ||
                        queuedMove?.type === "charged"
                          ? "none"
                          : "auto",
                    }}
                    type="button"
                  >
                    <div
                      style={{
                        background: "green",
                        height: `${(energy * 100) / chargedMove.energy}%`, // 7 / 35 ... x% / 100%
                        width: "100%",
                        position: "absolute",
                        bottom: 0,
                        transition: `height ${
                          pokemon.fastMove.turns * TURN_MS
                        }ms cubic-bezier(1.000, -0.125, 0.770, 0.990)`,
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div
              style={{
                height: 10,
                width: "100%",
                backgroundColor: "lightgrey",
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  height: 10,
                  width: `${energy}%`,
                  backgroundColor: "green",
                  borderRadius: 5,
                  color: "white",
                  fontSize: 8,
                  paddingLeft: 2,
                  transition: `width ${
                    pokemon.fastMove.turns * TURN_MS
                  }ms cubic-bezier(1.000, -0.125, 0.770, 0.990)`,
                }}
              >
                {energy}
              </div>
            </div>
          </div>
        </div>
        <p className={styles.description}>
          Hit Rate:{" "}
          {hitRate.length
            ? round(
                (hitRate.filter((h) => h === "GOT IT").length /
                  hitRate.length) *
                  100
              )
            : "--"}
          %
        </p>
      </main>
      <ToastContainer
        autoClose={1000}
        closeOnClick
        hideProgressBar
        limit={1}
        position="top-center"
        transition={Slide}
      />
    </div>
  ) : null;
};

export default Practice;
