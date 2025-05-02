import { Ant } from "./ant";
import { Beetle } from "./beetle";
import { Cockroach } from "./cockroach";
import { Ladybug } from "./ladybug";
import { Spider } from "./spider";
import { Wasp } from "./wasp";
import { Scorpion } from "./scorpion";
import { Butterfly } from "./butterfly";
import { Mosquito } from "./mosquito";
import { Mantis } from "./mantis";
import { StickBug } from "./stick-bug";
import { Centipede } from "./centipede";
import { Cricket } from "./cricket";
import { Dragonfly } from "./dragonfly";
import { Cicada } from "./cicada";
import { Bee } from "./bee";
import { WaterBug } from "./waterBug";
import { Worm } from "./worm";
import { Grasshopper } from "./grasshopper";
import { Moth } from "./moth";
import { Fly } from "./fly";
import { Snail } from "./snail";
import { Caterpillar } from "./caterpillar";
import { Earwig } from "./earwig";
import { Marimbondo } from "./marimbondo";
import { EmeraldWasp } from "./emerald-wasp";
import { Tanajura } from "./tanajura";
import { Termite } from "./termite";
import { Firefly } from "./firefly";
import { VelvetAnt } from "./velvet-ant";

export const insectDrawingComponents = {
  ant: Ant,
  spider: Spider,
  beetle: Beetle,
  ladybug: Ladybug,
  wasp: Wasp,
  cockroach: Cockroach,
  scorpion: Scorpion,
  butterfly: Butterfly,
  mosquito: Mosquito,
  mantis: Mantis,
  stick_bug: StickBug,
  centipede: Centipede,
  cricket: Cricket,
  dragonfly: Dragonfly,
  worm: Worm,
  cicada: Cicada,
  bee: Bee,
  grasshopper: Grasshopper,
  water_bug: WaterBug,
  moth: Moth,
  fly: Fly,
  snail: Snail,
  caterpillar: Caterpillar,
  earwig: Earwig,
  marimbondo: Marimbondo,
  emeraldWasp: EmeraldWasp,
  tanajura: Tanajura,
  termite: Termite,
  firefly: Firefly,
  velvet_ant: VelvetAnt
};

export type InsectType = 
  | "ant" 
  | "spider" 
  | "beetle" 
  | "cockroach" 
  | "ladybug" 
  | "wasp"
  | "scorpion"
  | "butterfly"
  | "mosquito"
  | "mantis"
  | "stick_bug"
  | "centipede"
  | "cricket"
  | "dragonfly"
  | "cicada"
  | "bee"
  | "water_bug"
  | "worm"
  | "grasshopper"
  | "moth"
  | "snail"
  | "fly"
  | "caterpillar"
  | "earwig"
  | "marimbondo"
  | "emeraldWasp"
  | "tanajura"
  | "termite"
  | "firefly"
  | "velvet_ant";
  