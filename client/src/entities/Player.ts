import { Graphics } from "pixi.js";
import type { CharacterDefinition } from "./characterTypes";
import type { EquipmentBonuses } from "./equipmentTypes";

/**
 * Personnage jouable — Phase 11 : les statistiques de départ viennent maintenant d'une
 * CharacterDefinition (voir characterTypes.ts) au lieu d'être fixes, pour permettre plusieurs
 * personnages avec des styles de jeu différents (section 11 du GDD).
 * Phase 14 : les bonus d'équipement (arme + artéfact) s'ajoutent par-dessus les stats de base.
 * Compétences/ultime/passif toujours pas implémentés à ce stade (voir characterTypes.ts).
 */
export class Player {
  public view: Graphics;
  public speed: number;

  public hp: number;
  public maxHp: number;
  public damage: number;
  public fireRateMs: number;
  public level = 1;
  public xp = 0;
  public xpToNextLevel = 20;
  public alive = true;
  public characterId: string;
  public characterName: string;

  constructor(
    x: number,
    y: number,
    definition: CharacterDefinition,
    equipment?: EquipmentBonuses,
    skinColor?: number
  ) {
    this.characterId = definition.id;
    this.characterName = definition.name;
    this.speed = definition.baseSpeed + (equipment?.bonusSpeed ?? 0);
    this.hp = definition.baseHp + (equipment?.bonusMaxHp ?? 0);
    this.maxHp = this.hp;
    this.damage = definition.baseDamage + (equipment?.bonusDamage ?? 0);
    this.fireRateMs = Math.max(100, definition.baseFireRateMs + (equipment?.bonusFireRateMs ?? 0));

    this.view = new Graphics();
    this.view.beginFill(skinColor ?? definition.color);
    this.view.drawCircle(0, 0, 16);
    this.view.endFill();
    this.view.x = x;
    this.view.y = y;
  }

  move(dx: number, dy: number) {
    // Normalisation pour éviter d'aller plus vite en diagonale
    const length = Math.hypot(dx, dy) || 1;
    this.view.x += (dx / length) * this.speed;
    this.view.y += (dy / length) * this.speed;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  /** Retourne true si le joueur vient de monter de niveau (pour déclencher le choix d'amélioration). */
  gainXp(amount: number): boolean {
    this.xp += amount;
    if (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level += 1;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.3);
      return true;
    }
    return false;
  }
}
