import { fetchBase, upgradeBase, fetchProgression, type BaseState, type ProgressionState } from "../network/api";

/**
 * Écran de la base, affiché entre la connexion et le jeu.
 * MVP : un seul bâtiment (le QG) qu'on peut améliorer avec de l'or.
 * Phase 10 : affiche aussi la progression du compte (niveau/XP, expéditions, succès).
 * Phase 17 : les écrans annexes (gacha, équipement, cosmétiques, classement) sont chargés à
 * la demande (import dynamique) plutôt que dans le bundle initial — voir journal-17.
 */
export class BaseScreen {
  private container: HTMLDivElement;
  private state: BaseState | null = null;
  private progression: ProgressionState | null = null;

  constructor(private token: string, private onEnterExpedition: () => void) {
    this.container = document.createElement("div");
    this.mount();
  }

  private mount() {
    this.container.id = "base-screen";
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
      // Chargés en parallèle : la base (déjà là depuis la Phase 6) et la progression (Phase 10, nouvelle).
      [this.state, this.progression] = await Promise.all([
        fetchBase(this.token),
        fetchProgression(this.token),
      ]);
      this.render();
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur de chargement de la base : ${
        err instanceof Error ? err.message : "inconnue"
      }</p>`;
    }
  }

  private renderProgressionPanel(): string {
    if (!this.progression) return "";
    const { accountLevel, accountXp, xpForNextLevel, expeditionsCompleted, achievements } = this.progression;
    const xpPercent =
      xpForNextLevel === null ? 100 : Math.min(100, Math.round((accountXp / xpForNextLevel) * 100));
    const xpLabel = xpForNextLevel === null ? "Niveau maximum" : `${accountXp} / ${xpForNextLevel} XP`;

    const achievementsHtml = achievements
      .map(
        (a) => `
        <li title="${a.description}" style="opacity:${a.unlocked ? "1" : "0.35"};">
          ${a.unlocked ? "🏆" : "🔒"} ${a.name}
        </li>`
      )
      .join("");

    return `
      <div style="text-align:left; font-size:13px; border-top:1px solid #333; padding-top:12px; margin-top:4px;">
        <p style="margin:0 0 4px 0;">Compte — niveau <strong>${accountLevel}</strong></p>
        <div style="background:#333; border-radius:4px; height:8px; overflow:hidden; margin-bottom:4px;">
          <div style="background:#4dd0e1; height:100%; width:${xpPercent}%;"></div>
        </div>
        <p style="margin:0 0 8px 0; color:#aaa;">${xpLabel} • ${expeditionsCompleted} expédition(s) terminée(s)</p>
        <p style="margin:0 0 4px 0;">Succès :</p>
        <ul style="margin:0; padding-left:18px; list-style:none;">${achievementsHtml}</ul>
      </div>
    `;
  }

  private render() {
    if (!this.state) return;
    const { hqLevel, gold, nextUpgradeCost } = this.state;
    const canAfford = nextUpgradeCost !== null && gold >= nextUpgradeCost;

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:14px; width:320px; background:#1c1c1c; padding:24px; border-radius:8px; text-align:center;">
        <h2 style="margin:0;">Votre base</h2>
        <div style="font-size:15px;">
          <p style="margin:4px 0;">QG — niveau <strong>${hqLevel}</strong></p>
          <p style="margin:4px 0;">Or : <strong>${gold}</strong></p>
        </div>
        <button id="upgrade-btn" ${canAfford ? "" : "disabled"}
          style="padding:10px; border-radius:4px; border:none; cursor:${canAfford ? "pointer" : "not-allowed"};
                 background:${canAfford ? "#4dd0e1" : "#444"}; color:${canAfford ? "#111" : "#888"}; font-weight:bold;">
          ${
            nextUpgradeCost === null
              ? "Niveau maximum atteint"
              : `Améliorer le QG (${nextUpgradeCost} or)`
          }
        </button>
        <p id="upgrade-error" style="color:#ff6b6b; min-height:16px; margin:0; font-size:13px;"></p>
        <button id="gacha-btn"
          style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#b388ff; color:#111; font-weight:bold;">
          Centre de recrutement
        </button>
        <button id="equipment-btn"
          style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#ffd166; color:#111; font-weight:bold;">
          Équipement
        </button>
        <button id="cosmetics-btn"
          style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#f77f00; color:#111; font-weight:bold;">
          Cosmétiques
        </button>
        <button id="leaderboard-btn"
          style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#00f5d4; color:#111; font-weight:bold;">
          Classement
        </button>
        <button id="expedition-btn"
          style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#66bb6a; color:#111; font-weight:bold;">
          Partir en expédition
        </button>
        ${this.renderProgressionPanel()}
      </div>
    `;

    const upgradeBtn = this.container.querySelector("#upgrade-btn") as HTMLButtonElement;
    const errorEl = this.container.querySelector("#upgrade-error") as HTMLParagraphElement;
    const gachaBtn = this.container.querySelector("#gacha-btn") as HTMLButtonElement;
    const equipmentBtn = this.container.querySelector("#equipment-btn") as HTMLButtonElement;
    const cosmeticsBtn = this.container.querySelector("#cosmetics-btn") as HTMLButtonElement;
    const leaderboardBtn = this.container.querySelector("#leaderboard-btn") as HTMLButtonElement;
    const expeditionBtn = this.container.querySelector("#expedition-btn") as HTMLButtonElement;

    cosmeticsBtn.addEventListener("click", async () => {
      this.destroy();
      const { CosmeticsScreen } = await import("./CosmeticsScreen");
      new CosmeticsScreen(this.token, () => {
        this.container = document.createElement("div");
        this.mount();
      });
    });

    leaderboardBtn.addEventListener("click", async () => {
      this.destroy();
      const { LeaderboardScreen } = await import("./LeaderboardScreen");
      new LeaderboardScreen(this.token, () => {
        this.container = document.createElement("div");
        this.mount();
      });
    });

    equipmentBtn.addEventListener("click", async () => {
      this.destroy();
      const { EquipmentScreen } = await import("./EquipmentScreen");
      new EquipmentScreen(this.token, () => {
        this.container = document.createElement("div");
        this.mount();
      });
    });

    gachaBtn.addEventListener("click", async () => {
      this.destroy();
      const { GachaScreen } = await import("./GachaScreen");
      new GachaScreen(this.token, () => {
        this.container = document.createElement("div");
        this.mount();
      });
    });

    upgradeBtn.addEventListener("click", async () => {
      errorEl.textContent = "";
      upgradeBtn.disabled = true;
      try {
        this.state = await upgradeBase(this.token);
        this.render();
      } catch (err) {
        errorEl.textContent = err instanceof Error ? err.message : "Erreur inconnue";
        upgradeBtn.disabled = false;
      }
    });

    expeditionBtn.addEventListener("click", () => {
      this.destroy();
      this.onEnterExpedition();
    });
  }

  private destroy() {
    this.container.remove();
  }
}
