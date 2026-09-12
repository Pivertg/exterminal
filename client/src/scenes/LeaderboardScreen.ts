import { fetchLeaderboard, type LeaderboardEntry } from "../network/api";

/**
 * Écran de classement (Phase 16, section 16 du GDD). MVP : un seul classement, par nombre
 * d'expéditions terminées. D'autres viendront plus tard (voir la note dans leaderboard.ts).
 */
export class LeaderboardScreen {
  private container: HTMLDivElement;

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
      const { entries } = await fetchLeaderboard(this.token);
      this.render(entries);
    } catch (err) {
      this.container.innerHTML = `<p style="color:#ff6b6b;">Erreur : ${err instanceof Error ? err.message : "inconnue"}</p>`;
    }
  }

  private render(entries: LeaderboardEntry[]) {
    const rows = entries.length
      ? entries
          .map(
            (e) => `
        <tr style="border-bottom:1px solid #333;">
          <td style="padding:6px; text-align:center;">${e.rank}</td>
          <td style="padding:6px;">${e.username}</td>
          <td style="padding:6px; text-align:center;">${e.accountLevel}</td>
          <td style="padding:6px; text-align:center;">${e.expeditionsCompleted}</td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="4" style="padding:12px; text-align:center; color:#888;">Aucune donnée pour l'instant</td></tr>`;

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px; width:420px; background:#1c1c1c; padding:24px; border-radius:8px;">
        <h2 style="margin:0; text-align:center;">Classement — expéditions terminées</h2>
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid #444; color:#aaa;">
              <th style="padding:6px;">#</th>
              <th style="padding:6px; text-align:left;">Joueur</th>
              <th style="padding:6px;">Niveau</th>
              <th style="padding:6px;">Expéditions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <button id="back-btn" style="padding:10px; border-radius:4px; border:none; cursor:pointer; background:#555; color:#eee; font-weight:bold;">
          Retour à la base
        </button>
      </div>
    `;

    (this.container.querySelector("#back-btn") as HTMLButtonElement).addEventListener("click", () => {
      this.destroy();
      this.onBack();
    });
  }

  private destroy() {
    this.container.remove();
  }
}
