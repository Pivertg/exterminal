import { Graphics } from "pixi.js";
import {
  BOSS_PATTERNS,
  BOSS_MAX_HP,
  PHASE_2_THRESHOLD,
  PHASE_2_COOLDOWN_MULTIPLIER,
  BASE_ATTACK_COOLDOWN_MS,
  PHASE_1_PATTERNS,
  PHASE_2_PATTERNS,
  type BossPatternId,
} from "./bossTypes";

export interface HazardZone {
  kind: "circle" | "rect";
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  rotation?: number;
  warning: boolean; // true = telegraph (pas encore dangereux), false = zone active (dégâts)
  damage: number;
}

type BossState = "cooldown" | "telegraph" | "execute";

export class Boss {
  public view: Graphics;
  public hp = BOSS_MAX_HP;
  public maxHp = BOSS_MAX_HP;
  public alive = true;
  public phase: 1 | 2 = 1;
  public shielded = false; // vrai tant que les pylônes ne sont pas détruits (Overload Pylons)
  public wantsPylonSpawn = false; // signal ponctuel lu puis remis à false par la scène
  public pullTarget: { active: boolean; strength: number } = { active: false, strength: 0 };

  private state: BossState = "cooldown";
  private cooldownTimer = BASE_ATTACK_COOLDOWN_MS;
  private telegraphTimer = 0;
  private executeTimer = 0;
  private currentPattern: BossPatternId | null = null;
  private hazards: HazardZone[] = [];
  private lastPlayerPos = { x: 0, y: 0 };
  private executeDamageApplied = false;

  constructor(x: number, y: number) {
    this.view = new Graphics();
    this.redraw();
    this.view.x = x;
    this.view.y = y;
  }

  private redraw() {
    this.view.clear();
    const color = this.phase === 1 ? 0x8d99ae : 0xef233c;
    this.view.beginFill(color);
    this.view.drawRoundedRect(-64, -64, 128, 128, 12);
    this.view.endFill();
  }

  private pickPattern(): BossPatternId {
    const pool = this.phase === 1 ? PHASE_1_PATTERNS : PHASE_2_PATTERNS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** Appelé une fois par frame par la scène. targetX/Y = position du joueur. */
  update(deltaMS: number, targetX: number, targetY: number) {
    this.lastPlayerPos = { x: targetX, y: targetY };

    // Transition de phase à 50% PV
    if (this.phase === 1 && this.hp <= this.maxHp * PHASE_2_THRESHOLD) {
      this.phase = 2;
      this.redraw();
    }

    if (this.state === "cooldown") {
      this.cooldownTimer -= deltaMS;
      if (this.cooldownTimer <= 0) {
        this.startTelegraph(this.pickPattern());
      }
      return;
    }

    if (this.state === "telegraph") {
      this.telegraphTimer -= deltaMS;
      if (this.telegraphTimer <= 0) {
        this.beginExecute();
      }
      return;
    }

    if (this.state === "execute") {
      this.executeTimer -= deltaMS;
      if (this.executeTimer <= 0) {
        this.endExecute();
      }
    }
  }

  private startTelegraph(pattern: BossPatternId) {
    this.currentPattern = pattern;
    this.state = "telegraph";
    const config = BOSS_PATTERNS[pattern];
    this.telegraphTimer = config.telegraphMs;
    this.hazards = this.buildHazards(pattern, true);
  }

  private beginExecute() {
    if (!this.currentPattern) return;
    const config = BOSS_PATTERNS[this.currentPattern];
    this.state = "execute";
    this.executeTimer = config.executeMs;
    this.hazards = this.buildHazards(this.currentPattern, false);
    this.executeDamageApplied = false;

    if (this.currentPattern === "FAN_PULL") {
      this.pullTarget = { active: true, strength: 6 };
    }
    if (this.currentPattern === "OVERLOAD_PYLONS") {
      this.wantsPylonSpawn = true;
    }
  }

  private endExecute() {
    this.state = "cooldown";
    this.hazards = [];
    this.pullTarget = { active: false, strength: 0 };
    const baseCooldown = BASE_ATTACK_COOLDOWN_MS;
    this.cooldownTimer = this.phase === 2 ? baseCooldown * PHASE_2_COOLDOWN_MULTIPLIER : baseCooldown;
    this.currentPattern = null;
  }

  private buildHazards(pattern: BossPatternId, warning: boolean): HazardZone[] {
    const config = BOSS_PATTERNS[pattern];
    const { x: px, y: py } = this.lastPlayerPos;

    switch (pattern) {
      case "MORTAR_SALVO": {
        // 3 zones circulaires, dont une centrée sur le joueur pour forcer un déplacement
        const zones: HazardZone[] = [
          { kind: "circle", x: px, y: py, radius: 55, warning, damage: config.damage },
        ];
        for (let i = 0; i < 2; i++) {
          zones.push({
            kind: "circle",
            x: this.view.x + (Math.random() - 0.5) * 500,
            y: this.view.y + (Math.random() - 0.5) * 500,
            radius: 55,
            warning,
            damage: config.damage,
          });
        }
        return zones;
      }
      case "SMASH_WAVE":
        return [{ kind: "circle", x: this.view.x, y: this.view.y, radius: 180, warning, damage: config.damage }];
      case "LASER_SWEEP": {
        // Couloir rectangulaire entre le boss et la position du joueur au moment du telegraph
        const dx = px - this.view.x;
        const dy = py - this.view.y;
        const angle = Math.atan2(dy, dx);
        const length = 700;
        return [
          {
            kind: "rect",
            x: this.view.x + Math.cos(angle) * (length / 2),
            y: this.view.y + Math.sin(angle) * (length / 2),
            width: length,
            height: 60,
            rotation: angle,
            warning,
            damage: config.damage,
          },
        ];
      }
      case "OVERLOAD_PYLONS":
      case "FAN_PULL":
      default:
        return [];
    }
  }

  getHazards(): HazardZone[] {
    return this.hazards;
  }

  /**
   * Appelée chaque frame par la scène pendant l'exécution d'une attaque.
   * Retourne les dégâts à infliger au joueur s'il se trouve dans une zone active
   * (warning === false). Ne s'applique qu'une fois par attaque, pas à chaque frame.
   */
  checkHazardHit(playerX: number, playerY: number): number {
    if (this.state !== "execute" || this.executeDamageApplied) return 0;

    let totalDamage = 0;
    for (const hazard of this.hazards) {
      if (hazard.warning) continue;
      if (this.isPointInHazard(playerX, playerY, hazard)) {
        totalDamage += hazard.damage;
      }
    }
    if (totalDamage > 0) this.executeDamageApplied = true;
    return totalDamage;
  }

  private isPointInHazard(px: number, py: number, hazard: HazardZone): boolean {
    if (hazard.kind === "circle") {
      return Math.hypot(px - hazard.x, py - hazard.y) < (hazard.radius ?? 0);
    }
    // rect : on ramène le point dans le repère local (non tourné) du rectangle
    const rotation = hazard.rotation ?? 0;
    const dx = px - hazard.x;
    const dy = py - hazard.y;
    const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
    const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
    return Math.abs(localX) < (hazard.width ?? 0) / 2 && Math.abs(localY) < (hazard.height ?? 0) / 2;
  }

  takeDamage(amount: number) {
    const multiplier = this.shielded ? 0.3 : 1;
    this.hp -= amount * multiplier;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  notifyPylonsDestroyed() {
    this.shielded = false;
  }
}
