import { fetchGacha, pullGacha, type GachaState, type PullResult } from "../network/api";
import { CHARACTER_DEFINITIONS } from "../entities/characterTypes";

const RARITY_STARS: Record<number, string> = { 2: "★★", 3: "★★★", 4: "★★★★", 5: "★★★★★" };

/**
 * Écran de recrutement (Phase 13, section 12 du GDD).
 * Taux affichés en clair (transparence exigée par le GDD), pity visible, pas de paiement réel.
 */
export class GachaScreen {
  private container: HTMLDivElement;
  private state: GachaState | null = null;

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
      this.state = await fetchGacha(this.token);
      this.render();
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur : ${err instanceof Error ? err.message : "inconnue"}</p>`;
    }
  }

  private render(lastResult?: PullResult) {
    if (!this.state) return;
    const { crystals, pullCost, pullsSincePity, pityThreshold, rates, ownedCharacterIds } = this.state;
    const canAfford = crystals >= pullCost;

    const ratesHtml = Object.entries(rates)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([rarity, chance]) => `<li>${RARITY_STARS[Number(rarity)]} — ${chance}%</li>`)
      .join("");

    const resultHtml = lastResult
      ? (() => {
          const character = CHARACTER_DEFINITIONS[lastResult.characterId];
          return `
            <div style="border:2px solid #${character.color.toString(16).padStart(6, "0")}; border-radius:8px; padding:12px; margin:8px 0;">
              <p style="margin:0; font-size:13px; color:#ffd166;">${RARITY_STARS[lastResult.rarity]}</p>
              <p style="margin:4px 0; font-weight:bold;">${character.name}</p>
              <p style="margin:0; font-size:12px; color:#aaa;">
                ${lastResult.isNew ? "Nouveau personnage débloqué !" : `Déjà possédé — +${lastResult.consolationRefund} cristaux de consolation`}
              </p>
            </div>
          `;
        })()
      : "";

    const ownedHtml = Object.values(CHARACTER_DEFINITIONS)
      .map((c) => {
        const owned = ownedCharacterIds.includes(c.id);
        return `<span style="opacity:${owned ? 1 : 0.3}; font-size:12px;" title="${c.name}">${RARITY_STARS[c.rarity]} ${c.name}${owned ? "" : " (non possédé)"}</span>`;
      })
      .join("<br/>");

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:340px; background:#1c1c1c; padding:24px; border-radius:8px; text-align:center;">
        <h2 style="margin:0;">Centre de recrutement</h2>
        <p style="margin:0;">Cristaux : <strong>${crystals}</strong></p>
        <p style="margin:0; font-size:12px; color:#aaa;">Pity : ${pullsSincePity}/${pityThreshold} (★★★★+ garanti à ${pityThreshold})</p>

        <button id="pull-btn" ${canAfford ? "" : "disabled"}
          style="padding:14px; border-radius:8px; border:none; cursor:${canAfford ? "pointer" : "not-allowed"};
                 background:${canAfford ? "#b388ff" : "#444"}; color:${canAfford ? "#111" : "#888"}; font-weight:bold;">
          Recruter (${pullCost} cristaux)
        </button>
        <p id="pull-error" style="color:#ff6b6b; min-height:16px; margin:0; font-size:13px;"></p>

        <div id="result-slot">${resultHtml}</div>

        <div style="text-align:left; font-size:12px; border-top:1px solid #333; padding-top:10px;">
          <p style="margin:0 0 4px;">Taux (transparents) :</p>
          <ul style="margin:0; padding-left:18px;">${ratesHtml}</ul>
        </div>

        <div style="text-align:left; font-size:12px; border-top:1px solid #333; padding-top:10px;">
          <p style="margin:0 0 4px;">Personnages :</p>
          ${ownedHtml}
        </div>

        <button id="back-btn" style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#555; color:#eee; font-weight:bold;">
          Retour à la base
        </button>
      </div>
    `;

    const pullBtn = this.container.querySelector("#pull-btn") as HTMLButtonElement;
    const errorEl = this.container.querySelector("#pull-error") as HTMLParagraphElement;
    const backBtn = this.container.querySelector("#back-btn") as HTMLButtonElement;

    pullBtn.addEventListener("click", async () => {
      errorEl.textContent = "";
      pullBtn.disabled = true;
      try {
        const result = await pullGacha(this.token);
        this.state = await fetchGacha(this.token); // recharge l'état complet (cristaux, pity, possédés)
        this.render(result);
      } catch (err) {
        errorEl.textContent = err instanceof Error ? err.message : "Erreur inconnue";
        pullBtn.disabled = false;
      }
    });

    backBtn.addEventListener("click", () => {
      this.destroy();
      this.onBack();
    });
  }

  private destroy() {
    this.container.remove();
  }
}
