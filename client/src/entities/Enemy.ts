import { Graphics } from "pixi.js";
import { EnemyDefinition, EnemyTypeId } from "./enemyTypes";

/**
 * Ennemi générique paramétré par une EnemyDefinition (voir enemyTypes.ts).
 * Phase 8 du GDD : plusieurs types de comportements plutôt qu'un seul.
 */
export class Enemy {
  public view: Graphics;
  public typeId: EnemyTypeId;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public contactDamage: number;
  public xpReward: number;
  public radius: number;
  public alive = true;

  /** Défini uniquement pour les ennemis à distance (ex: Cracheur). */
  public ranged?: EnemyDefinition["ranged"];
  public timeSinceLastShot = 0;

  constructor(x: number, y: number, definition: EnemyDefinition) {
    this.typeId = definition.id;
    this.hp = definition.hp;
    this.maxHp = definition.hp;
    this.speed = definition.speed;
    this.contactDamage = definition.contactDamage;
    this.xpReward = definition.xpReward;
    this.radius = definition.radius;
    this.ranged = definition.ranged;

    this.view = new Graphics();
    this.view.beginFill(definition.color);
    this.view.drawRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    this.view.endFill();
    this.view.x = x;
    this.view.y = y;
  }

  /** Déplacement au contact — utilisé par tous les types, y compris les ennemis à distance qui gardent leurs distances. */
  moveToward(targetX: number, targetY: number) {
    const dx = targetX - this.view.x;
    const dy = targetY - this.view.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (this.ranged) {
      // Garde ses distances : avance si trop loin, recule si trop près, reste immobile dans la fourchette idéale.
      const diff = dist - this.ranged.preferredDistance;
      if (Math.abs(diff) < 15) return;
      const dir = diff > 0 ? 1 : -1;
      this.view.x += (dx / dist) * this.speed * dir;
      this.view.y += (dy / dist) * this.speed * dir;
      return;
    }

    this.view.x += (dx / dist) * this.speed;
    this.view.y += (dy / dist) * this.speed;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) this.alive = false;
  }
}
