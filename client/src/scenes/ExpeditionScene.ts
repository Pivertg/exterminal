import { Application, Container, Graphics } from "pixi.js";
import type { Room } from "colyseus.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { ENEMY_DEFINITIONS, pickEnemyType } from "../entities/enemyTypes";
import { getCharacterDefinition } from "../entities/characterTypes";
import { EQUIPMENT_DEFINITIONS, type EquipmentBonuses } from "../entities/equipmentTypes";
import { Boss, type HazardZone } from "../entities/Boss";
import { InputManager } from "../network/InputManager";
import { completeExpedition } from "../network/api";

const WAVE_DURATION_MS = 60_000; // durée de la phase de vagues avant l'arrivée du boss
const POSITION_SYNC_INTERVAL_MS = 100; // ~10 envois/seconde, suffisant pour un prototype à 2 joueurs

interface UpgradeChoice {
  label: string;
  apply: (player: Player) => void;
}

const UPGRADE_CHOICES: UpgradeChoice[] = [
  { label: "+20% dégâts", apply: (p) => (p.damage = Math.round(p.damage * 1.2)) },
  { label: "+15% vitesse", apply: (p) => (p.speed = +(p.speed * 1.15).toFixed(2)) },
  { label: "Tir plus rapide (-15%)", apply: (p) => (p.fireRateMs = Math.round(p.fireRateMs * 0.85)) },
  { label: "+30 PV max", apply: (p) => { p.maxHp += 30; p.hp += 30; } },
];

export class ExpeditionScene {
  private app: Application;
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private input: InputManager;
  private hud: HTMLDivElement;
  private elapsedMs = 0;
  private timeSinceLastShot = 0;
  private timeSinceLastSpawn = 0;
  private spawnIntervalMs = 1500;
  private ended = false;

  private phase: "waves" | "boss" = "waves";
  private boss: Boss | null = null;
  private hazardsLayer: Container;
  private pylonsSpawned = false;

  // Multijoueur (Phase 12) — optionnel : room === null signifie une partie solo classique.
  private remotePlayersLayer: Container;
  private remotePlayerViews = new Map<string, Graphics>();
  private timeSinceLastSync = 0;

  constructor(
    private token: string,
    characterId: string,
    private onFinished: () => void,
    private room: Room | null = null,
    equipmentBonuses?: EquipmentBonuses,
    skinColor?: number,
    private playerTitle: string = ""
  ) {
    this.app = new Application({ resizeTo: window, backgroundColor: 0x14141a });
    document.getElementById("app")!.appendChild(this.app.view as HTMLCanvasElement);

    const grid = new Graphics();
    grid.lineStyle(1, 0x22222a);
    for (let x = 0; x < 2000; x += 50) grid.moveTo(x, 0).lineTo(x, 2000);
    for (let y = 0; y < 2000; y += 50) grid.moveTo(0, y).lineTo(2000, y);
    this.app.stage.addChild(grid);

    const character = getCharacterDefinition(characterId);
    this.player = new Player(this.app.screen.width / 2, this.app.screen.height / 2, character, equipmentBonuses, skinColor);
    this.app.stage.addChild(this.player.view);

    this.input = new InputManager();
    this.hud = this.createHud();

    this.hazardsLayer = new Container();
    this.app.stage.addChild(this.hazardsLayer);

    this.remotePlayersLayer = new Container();
    this.app.stage.addChild(this.remotePlayersLayer);

    this.app.ticker.add(() => this.update(this.app.ticker.deltaMS));
  }

  private createHud(): HTMLDivElement {
    const hud = document.createElement("div");
    Object.assign(hud.style, {
      position: "fixed",
      top: "8px",
      left: "8px",
      color: "#eee",
      fontFamily: "sans-serif",
      fontSize: "13px",
      background: "#0008",
      padding: "6px 10px",
      borderRadius: "4px",
      lineHeight: "1.5",
    });
    document.body.appendChild(hud);
    return hud;
  }

  private updateHud() {
    const bossLine =
      this.phase === "boss" && this.boss
        ? `<br/>Automate Surchauffé — PV ${Math.max(0, Math.round(this.boss.hp))}/${this.boss.maxHp} (Phase ${this.boss.phase})${this.boss.shielded ? " — Blindé (détruisez les pylônes)" : ""}`
        : `<br/>Vagues — prochain boss dans ${Math.max(0, Math.ceil((WAVE_DURATION_MS - this.elapsedMs) / 1000))}s`;

    this.hud.innerHTML = `
      ${this.player.characterName}${this.playerTitle ? ` — <span style="color:#ffd166;">"${this.playerTitle}"</span>` : ""}<br/>
      PV : ${Math.max(0, Math.round(this.player.hp))} / ${this.player.maxHp}<br/>
      Niveau ${this.player.level} — XP ${this.player.xp}/${this.player.xpToNextLevel}
      ${bossLine}
    `;
  }

  private spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    let x = 0;
    let y = 0;
    if (side === 0) { x = Math.random() * w; y = -30; }
    else if (side === 1) { x = w + 30; y = Math.random() * h; }
    else if (side === 2) { x = Math.random() * w; y = h + 30; }
    else { x = -30; y = Math.random() * h; }

    const definition = ENEMY_DEFINITIONS[pickEnemyType(this.elapsedMs)];
    const enemy = new Enemy(x, y, definition);
    this.enemies.push(enemy);
    this.app.stage.addChild(enemy.view);
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const e of this.enemies) {
      const d = Math.hypot(e.view.x - this.player.view.x, e.view.y - this.player.view.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  private shootAt(enemy: Enemy) {
    const p = new Projectile(this.player.view.x, this.player.view.y, enemy.view.x, enemy.view.y, this.player.damage);
    this.projectiles.push(p);
    this.app.stage.addChild(p.view);
  }

  private spawnBoss() {
    this.phase = "boss";
    this.enemies.forEach((e) => this.app.stage.removeChild(e.view));
    this.enemies = [];

    this.boss = new Boss(this.app.screen.width / 2, this.app.screen.height / 2 - 150);
    this.app.stage.addChild(this.boss.view);
  }

  private spawnPylons(boss: Boss) {
    const offsets = [-70, 70];
    for (const offsetX of offsets) {
      const pylon = new Enemy(boss.view.x + offsetX, boss.view.y + 90, ENEMY_DEFINITIONS.PYLON);
      this.enemies.push(pylon);
      this.app.stage.addChild(pylon.view);
    }
    this.pylonsSpawned = true;
    boss.shielded = true;
  }

  private drawHazards(hazards: HazardZone[]) {
    this.hazardsLayer.removeChildren();
    for (const hazard of hazards) {
      const g = new Graphics();
      const color = hazard.warning ? 0xffd166 : 0xd90429;
      const alpha = hazard.warning ? 0.3 : 0.5;
      g.beginFill(color, alpha);
      if (hazard.kind === "circle") {
        g.drawCircle(0, 0, hazard.radius ?? 0);
      } else {
        g.drawRect(-(hazard.width ?? 0) / 2, -(hazard.height ?? 0) / 2, hazard.width ?? 0, hazard.height ?? 0);
      }
      g.endFill();
      g.x = hazard.x;
      g.y = hazard.y;
      g.rotation = hazard.rotation ?? 0;
      this.hazardsLayer.addChild(g);
    }
  }

  private update(deltaMS: number) {
    if (this.ended) return;
    this.elapsedMs += deltaMS;

    if (this.room) this.syncMultiplayer(deltaMS);

    // Déplacement joueur
    const { dx, dy } = this.input.getDirection();
    if (dx !== 0 || dy !== 0) this.player.move(dx, dy);

    if (this.phase === "waves") {
      // Spawn progressif d'ennemis
      this.timeSinceLastSpawn += deltaMS;
      if (this.timeSinceLastSpawn >= this.spawnIntervalMs) {
        this.timeSinceLastSpawn = 0;
        this.spawnEnemy();
        // Légère accélération du rythme de spawn au fil du temps
        this.spawnIntervalMs = Math.max(500, this.spawnIntervalMs - 20);
      }
    }

    // Tir automatique vers l'ennemi (ou le boss) le plus proche
    this.timeSinceLastShot += deltaMS;
    if (this.timeSinceLastShot >= this.player.fireRateMs) {
      const target = this.findNearestEnemy();
      if (target) {
        this.timeSinceLastShot = 0;
        this.shootAt(target);
      } else if (this.phase === "boss" && this.boss) {
        this.timeSinceLastShot = 0;
        const p = new Projectile(this.player.view.x, this.player.view.y, this.boss.view.x, this.boss.view.y, this.player.damage);
        this.projectiles.push(p);
        this.app.stage.addChild(p.view);
      }
    }

    // Mise à jour des ennemis (déplacement + dégâts de contact + tir à distance)
    // Pendant le combat de boss, ce tableau ne contient que les pylônes (fixes, sans danger de contact).
    for (const enemy of this.enemies) {
      enemy.moveToward(this.player.view.x, this.player.view.y);
      const dist = Math.hypot(enemy.view.x - this.player.view.x, enemy.view.y - this.player.view.y);

      if (enemy.ranged) {
        enemy.timeSinceLastShot += deltaMS;
        if (enemy.timeSinceLastShot >= enemy.ranged.cooldownMs) {
          enemy.timeSinceLastShot = 0;
          const p = new Projectile(
            enemy.view.x,
            enemy.view.y,
            this.player.view.x,
            this.player.view.y,
            enemy.ranged.projectileDamage,
            "enemy"
          );
          this.projectiles.push(p);
          this.app.stage.addChild(p.view);
        }
      } else if (dist < enemy.radius + 12 && enemy.contactDamage > 0) {
        this.player.takeDamage(enemy.contactDamage * (deltaMS / 1000));
      }
    }

    // Mise à jour du boss (patterns d'attaque, zones de danger, tirage/aspiration)
    if (this.phase === "boss" && this.boss) {
      const boss = this.boss;
      boss.update(deltaMS, this.player.view.x, this.player.view.y);
      this.drawHazards(boss.getHazards());

      const hazardDamage = boss.checkHazardHit(this.player.view.x, this.player.view.y);
      if (hazardDamage > 0) this.player.takeDamage(hazardDamage);

      if (boss.pullTarget.active) {
        const dx2 = boss.view.x - this.player.view.x;
        const dy2 = boss.view.y - this.player.view.y;
        const dist2 = Math.hypot(dx2, dy2) || 1;
        const pullSpeed = boss.pullTarget.strength * 60 * (deltaMS / 1000);
        this.player.view.x += (dx2 / dist2) * pullSpeed;
        this.player.view.y += (dy2 / dist2) * pullSpeed;
      }

      if (boss.wantsPylonSpawn && !this.pylonsSpawned) {
        this.spawnPylons(boss);
        boss.wantsPylonSpawn = false;
      }
    }

    // Mise à jour des projectiles + collisions (selon le propriétaire du projectile)
    for (const proj of this.projectiles) {
      proj.update();

      if (proj.owner === "player") {
        let hitSomething = false;
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const dist = Math.hypot(proj.view.x - enemy.view.x, proj.view.y - enemy.view.y);
          if (dist < enemy.radius + 6) {
            enemy.takeDamage(proj.damage);
            proj.dead = true;
            hitSomething = true;
            if (!enemy.alive) {
              const leveledUp = this.player.gainXp(enemy.xpReward);
              if (leveledUp) this.showLevelUpChoice();
            }
            break;
          }
        }
        if (!hitSomething && this.phase === "boss" && this.boss && this.boss.alive) {
          const dist = Math.hypot(proj.view.x - this.boss.view.x, proj.view.y - this.boss.view.y);
          if (dist < 70) {
            this.boss.takeDamage(proj.damage);
            proj.dead = true;
          }
        }
      } else {
        const dist = Math.hypot(proj.view.x - this.player.view.x, proj.view.y - this.player.view.y);
        if (dist < 18) {
          this.player.takeDamage(proj.damage);
          proj.dead = true;
        }
      }
    }

    // Nettoyage des entités mortes/hors-jeu
    this.enemies = this.enemies.filter((e) => {
      if (!e.alive) this.app.stage.removeChild(e.view);
      return e.alive;
    });
    this.projectiles = this.projectiles.filter((p) => {
      if (p.dead) this.app.stage.removeChild(p.view);
      return !p.dead;
    });

    // Une fois les deux pylônes détruits, le boss redevient vulnérable normalement
    if (this.pylonsSpawned && this.boss?.shielded) {
      const pylonsRemaining = this.enemies.some((e) => e.typeId === "PYLON");
      if (!pylonsRemaining) {
        this.boss.notifyPylonsDestroyed();
        this.pylonsSpawned = false;
      }
    }

    this.updateHud();

    // Conditions de fin
    if (!this.player.alive) {
      this.end(false);
      return;
    }
    if (this.phase === "waves" && this.elapsedMs >= WAVE_DURATION_MS) {
      this.spawnBoss();
    }
    if (this.phase === "boss" && this.boss && !this.boss.alive) {
      this.app.stage.removeChild(this.boss.view);
      this.hazardsLayer.removeChildren();
      this.end(true);
    }
  }

  private showLevelUpChoice() {
    this.app.ticker.stop();
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000a",
      fontFamily: "sans-serif",
      zIndex: "10",
    });

    const choices = [...UPGRADE_CHOICES].sort(() => Math.random() - 0.5).slice(0, 3);
    overlay.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
        <h2 style="color:#eee; margin:0 0 8px;">Niveau supérieur !</h2>
        <div id="choices" style="display:flex; gap:12px;"></div>
      </div>
    `;
    const choicesEl = overlay.querySelector("#choices") as HTMLDivElement;
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.label;
      Object.assign(btn.style, {
        padding: "16px 20px",
        borderRadius: "8px",
        border: "none",
        background: "#4dd0e1",
        color: "#111",
        fontWeight: "bold",
        cursor: "pointer",
      });
      btn.addEventListener("click", () => {
        choice.apply(this.player);
        overlay.remove();
        this.app.ticker.start();
      });
      choicesEl.appendChild(btn);
    });

    document.body.appendChild(overlay);
  }

  private async end(survived: boolean) {
    if (this.ended) return;
    this.ended = true;
    this.app.ticker.stop();

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#000c",
      fontFamily: "sans-serif",
      color: "#eee",
      flexDirection: "column",
      gap: "12px",
      zIndex: "10",
    });
    overlay.innerHTML = `<h2>${survived ? "Expédition réussie !" : "Vous avez été vaincu..."}</h2><p id="reward-text">Calcul de la récompense...</p>`;
    document.body.appendChild(overlay);

    try {
      const result = await completeExpedition(this.token);
      const rewardText = overlay.querySelector("#reward-text") as HTMLParagraphElement;
      const levelUpText = result.leveledUp ? ` — Niveau de compte supérieur : ${result.accountLevel} !` : "";
      const itemText = result.itemDropped
        ? ` — Objet trouvé : ${EQUIPMENT_DEFINITIONS[result.itemDropped]?.name ?? result.itemDropped} !`
        : "";
      rewardText.textContent = `Récompense : +${result.reward} or (total : ${result.gold}) — +${result.crystalsGained} cristaux — +${result.xpGained} XP${levelUpText}${itemText}`;
    } catch {
      const rewardText = overlay.querySelector("#reward-text") as HTMLParagraphElement;
      rewardText.textContent = "Erreur lors de la récupération de la récompense.";
    }

    const btn = document.createElement("button");
    btn.textContent = "Retour à la base";
    Object.assign(btn.style, {
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      background: "#66bb6a",
      color: "#111",
      fontWeight: "bold",
      cursor: "pointer",
    });
    btn.addEventListener("click", () => {
      this.destroy();
      overlay.remove();
      this.onFinished();
    });
    overlay.appendChild(btn);
  }

  /**
   * Envoie régulièrement notre position au serveur et met à jour l'affichage des autres
   * joueurs connectés à partir du state Colyseus. Voir la note de limite dans GameRoom.ts :
   * seule la position est synchronisée pour l'instant, pas les ennemis/le boss/le combat.
   */
  private syncMultiplayer(deltaMS: number) {
    if (!this.room) return;

    this.timeSinceLastSync += deltaMS;
    if (this.timeSinceLastSync >= POSITION_SYNC_INTERVAL_MS) {
      this.timeSinceLastSync = 0;
      this.room.send("move", { x: this.player.view.x, y: this.player.view.y });
    }

    const seenSessionIds = new Set<string>();
    this.room.state.players.forEach((remotePlayer: { x: number; y: number; username: string }, sessionId: string) => {
      if (sessionId === this.room!.sessionId) return; // ne pas afficher son propre fantôme
      seenSessionIds.add(sessionId);

      let view = this.remotePlayerViews.get(sessionId);
      if (!view) {
        view = new Graphics();
        view.beginFill(0xffd166, 0.6);
        view.drawCircle(0, 0, 16);
        view.endFill();
        this.remotePlayersLayer.addChild(view);
        this.remotePlayerViews.set(sessionId, view);
      }
      view.x = remotePlayer.x;
      view.y = remotePlayer.y;
    });

    // Nettoyage des joueurs qui ont quitté
    for (const [sessionId, view] of this.remotePlayerViews) {
      if (!seenSessionIds.has(sessionId)) {
        this.remotePlayersLayer.removeChild(view);
        this.remotePlayerViews.delete(sessionId);
      }
    }
  }

  private destroy() {
    this.app.destroy(true, { children: true });
    this.hud.remove();
    this.room?.leave();
  }
}
