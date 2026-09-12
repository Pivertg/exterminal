import { CHARACTER_DEFINITIONS } from "../entities/characterTypes";
import { fetchGacha } from "../network/api";

/**
 * Écran de choix du personnage (Phases 11 et 13), affiché après la base et avant l'expédition,
 * conformément à la boucle principale du GDD (section 2) :
 * COMPTE → BASE → CHOIX DU PERSONNAGE → EXPÉDITION.
 *
 * Depuis la Phase 13 : seuls les personnages réellement possédés (voir /api/gacha) sont
 * sélectionnables. "recrue" est toujours possédée par défaut (offerte à l'inscription).
 */
export class CharacterSelectScreen {
  private container: HTMLDivElement;
  private ownedCharacterIds: string[] = [];

  constructor(private token: string, private onSelect: (characterId: string) => void) {
    this.container = document.createElement("div");
    this.container.id = "character-select-screen";
    Object.assign(this.container.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111",
      fontFamily: "sans-serif",
      color: "#eee",
    });
    document.body.appendChild(this.container);
    this.load();
  }

  private async load() {
    try {
      const gacha = await fetchGacha(this.token);
      this.ownedCharacterIds = gacha.ownedCharacterIds;
      this.render();
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur : ${err instanceof Error ? err.message : "inconnue"}</p>`;
    }
  }

  private render() {
    const owned = Object.values(CHARACTER_DEFINITIONS).filter((c) => this.ownedCharacterIds.includes(c.id));

    const cards = owned
      .map(
        (c) => `
        <div style="display:flex; flex-direction:column; gap:8px; width:180px; background:#1c1c1c;
                    border:2px solid #${c.color.toString(16).padStart(6, "0")}; border-radius:8px; padding:16px; text-align:center;">
          <div style="width:48px; height:48px; border-radius:50%; background:#${c.color
            .toString(16)
            .padStart(6, "0")}; margin:0 auto;"></div>
          <h3 style="margin:4px 0 0;">${c.name}</h3>
          <p style="margin:0; font-size:12px; color:#aaa;">${c.roleLabel}</p>
          <p style="margin:4px 0; font-size:12px;">${c.description}</p>
          <p style="margin:0; font-size:11px; color:#888;">
            PV ${c.baseHp} • Dégâts ${c.baseDamage} • Vitesse ${c.baseSpeed}
          </p>
          <button data-character-id="${c.id}"
            style="padding:8px; border-radius:4px; border:none; cursor:pointer; background:#4dd0e1; color:#111; font-weight:bold;">
            Choisir
          </button>
        </div>`
      )
      .join("");

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px; align-items:center;">
        <h2 style="margin:0;">Choisissez votre personnage</h2>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center; max-width:800px;">${cards}</div>
        <p style="font-size:12px; color:#888;">D'autres personnages s'obtiennent au Centre de recrutement (base).</p>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>("button[data-character-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const characterId = btn.dataset.characterId!;
        this.destroy();
        this.onSelect(characterId);
      });
    });
  }

  private destroy() {
    this.container.remove();
  }
}
