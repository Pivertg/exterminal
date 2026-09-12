/**
 * Gère l'état du clavier. Simple et testable indépendamment du reste.
 */
export class InputManager {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
  }

  getDirection(): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;
    if (this.keys.has("arrowup") || this.keys.has("z") || this.keys.has("w")) dy -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s")) dy += 1;
    if (this.keys.has("arrowleft") || this.keys.has("q") || this.keys.has("a")) dx -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d")) dx += 1;
    return { dx, dy };
  }
}
