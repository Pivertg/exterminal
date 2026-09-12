import { Graphics } from "pixi.js";

export type ProjectileOwner = "player" | "enemy";

/**
 * Projectile générique, tiré automatiquement vers une cible (façon Brotato).
 * `owner` détermine qui peut être touché : un projectile "player" ne touche
 * que les ennemis, un projectile "enemy" (ex: le Cracheur, Phase 8) ne touche
 * que le joueur. La logique de collision reste dans ExpeditionScene.
 */
export class Projectile {
  public view: Graphics;
  public speed = 7;
  public damage: number;
  public owner: ProjectileOwner;
  public dead = false;
  private vx: number;
  private vy: number;
  private travelled = 0;
  private readonly maxRange = 600;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    owner: ProjectileOwner = "player"
  ) {
    this.damage = damage;
    this.owner = owner;
    this.view = new Graphics();
    this.view.beginFill(owner === "player" ? 0xffd166 : 0x2ec4b6);
    this.view.drawCircle(0, 0, 5);
    this.view.endFill();
    this.view.x = x;
    this.view.y = y;

    const dx = targetX - x;
    const dy = targetY - y;
    const length = Math.hypot(dx, dy) || 1;
    this.vx = (dx / length) * this.speed;
    this.vy = (dy / length) * this.speed;
  }

  update() {
    this.view.x += this.vx;
    this.view.y += this.vy;
    this.travelled += this.speed;
    if (this.travelled > this.maxRange) this.dead = true;
  }
}
