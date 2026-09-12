import { fetchCosmetics, buyCosmetic, equipCosmetic, type CosmeticsState } from "../network/api";
import { SKIN_DEFINITIONS, TITLE_DEFINITIONS } from "../entities/cosmeticTypes";

/**
 * Écran cosmétiques (Phase 15, section 14 du GDD). Aucun avantage compétitif — uniquement
 * visuel. Achats en or (pas de paiement réel).
 */
export class CosmeticsScreen {
  private container: HTMLDivElement;
  private state: CosmeticsState | null = null;

  constructor(private token: string, private onBack: () => void) {
    this.container = document.createElement("div");
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
      this.state = await fetchCosmetics(this.token);
      this.render();
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur : ${err instanceof Error ? err.message : "inconnue"}</p>`;
    }
  }

  private renderSkinCard(id: string): string {
    const skin = SKIN_DEFINITIONS[id];
    const owned = skin.cost === 0 || this.state!.owned.includes(id);
    const equipped = this.state!.equippedSkinId === id;
    const canAfford = this.state!.gold >= skin.cost;

    return `
      <div style="display:flex; flex-direction:column; gap:6px; width:120px; background:#1c1c1c;
                  border:2px solid #${skin.color.toString(16).padStart(6, "0")}; border-radius:8px; padding:10px; text-align:center;">
        <div style="width:36px; height:36px; border-radius:50%; background:#${skin.color.toString(16).padStart(6, "0")}; margin:0 auto;"></div>
        <p style="margin:0; font-size:12px; font-weight:bold;">${skin.name}</p>
        <p style="margin:0; font-size:11px; color:#aaa;">${skin.cost === 0 ? "Gratuit" : `${skin.cost} or`}</p>
        <button data-skin-id="${id}" ${equipped ? "disabled" : ""}
          style="padding:5px; border-radius:4px; border:none; font-size:11px; cursor:${equipped ? "default" : "pointer"};
                 background:${equipped ? "#4dd0e1" : owned ? "#66bb6a" : canAfford ? "#555" : "#333"};
                 color:${equipped ? "#111" : "#eee"};">
          ${equipped ? "Équipé" : owned ? "Équiper" : `Acheter (${skin.cost} or)`}
        </button>
      </div>
    `;
  }

  private renderTitleRow(id: string): string {
    const title = TITLE_DEFINITIONS[id];
    const owned = title.cost === 0 || this.state!.owned.includes(id);
    const equipped = this.state!.equippedTitleId === id;
    const canAfford = this.state!.gold >= title.cost;

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #333;">
        <span style="font-size:13px;">${title.name} <span style="color:#888; font-size:11px;">${title.cost === 0 ? "" : `(${title.cost} or)`}</span></span>
        <button data-title-id="${id}" ${equipped ? "disabled" : ""}
          style="padding:5px 10px; border-radius:4px; border:none; font-size:11px; cursor:${equipped ? "default" : "pointer"};
                 background:${equipped ? "#4dd0e1" : owned ? "#66bb6a" : canAfford ? "#555" : "#333"};
                 color:${equipped ? "#111" : "#eee"};">
          ${equipped ? "Équipé" : owned ? "Équiper" : "Acheter"}
        </button>
      </div>
    `;
  }

  private render() {
    if (!this.state) return;

    const skinsHtml = Object.keys(SKIN_DEFINITIONS).map((id) => this.renderSkinCard(id)).join("");
    const titlesHtml = Object.keys(TITLE_DEFINITIONS).map((id) => this.renderTitleRow(id)).join("");

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px; width:520px; background:#1c1c1c; padding:24px; border-radius:8px; text-align:center;">
        <h2 style="margin:0;">Cosmétiques</h2>
        <p style="margin:0;">Or : <strong>${this.state.gold}</strong></p>

        <div style="text-align:left;">
          <p style="margin:0 0 8px; font-size:13px;">Skins</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">${skinsHtml}</div>
        </div>

        <div style="text-align:left;">
          <p style="margin:0 0 8px; font-size:13px;">Titres</p>
          <div>${titlesHtml}</div>
        </div>

        <button id="back-btn" style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#555; color:#eee; font-weight:bold;">
          Retour à la base
        </button>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>("button[data-skin-id]").forEach((btn) => {
      btn.addEventListener("click", () => this.handleAction(btn.dataset.skinId!));
    });
    this.container.querySelectorAll<HTMLButtonElement>("button[data-title-id]").forEach((btn) => {
      btn.addEventListener("click", () => this.handleAction(btn.dataset.titleId!));
    });

    (this.container.querySelector("#back-btn") as HTMLButtonElement).addEventListener("click", () => {
      this.destroy();
      this.onBack();
    });
  }

  private async handleAction(itemId: string) {
    if (!this.state) return;
    const owned = this.state.owned.includes(itemId) || itemId === "defaut" || itemId === "aucun";
    try {
      if (!owned) {
        await buyCosmetic(this.token, itemId);
      }
      await equipCosmetic(this.token, itemId);
      this.state = await fetchCosmetics(this.token);
      this.render();
    } catch {
      // Silencieux pour le MVP — un message d'erreur plus visible viendra si besoin après tests.
    }
  }

  private destroy() {
    this.container.remove();
  }
}
