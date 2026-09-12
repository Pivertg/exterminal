import { login, register, type AuthResponse } from "../network/api";

/**
 * Écran de connexion/inscription affiché avant le jeu.
 * Volontairement en HTML simple (pas de Pixi) : plus rapide à faire et à modifier
 * pour un formulaire classique. Le rendu du jeu lui-même reste en Pixi.
 */
export class AuthScreen {
  private container: HTMLDivElement;
  private mode: "login" | "register" = "login";

  constructor(private onSuccess: (auth: AuthResponse) => void) {
    this.container = document.createElement("div");
    this.container.id = "auth-screen";
    this.applyStyles();
    document.body.appendChild(this.container);
    this.render();
  }

  private applyStyles() {
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
  }

  private render() {
    const isLogin = this.mode === "login";

    this.container.innerHTML = `
      <form id="auth-form" style="display:flex; flex-direction:column; gap:10px; width:280px; background:#1c1c1c; padding:24px; border-radius:8px;">
        <h2 style="margin:0 0 8px; text-align:center;">${isLogin ? "Connexion" : "Inscription"}</h2>
        <input name="username" placeholder="Pseudo" required minlength="3" maxlength="20"
          style="padding:8px; border-radius:4px; border:1px solid #444; background:#2a2a2a; color:#eee;" />
        ${
          isLogin
            ? ""
            : `<input name="email" type="email" placeholder="Email" required
                 style="padding:8px; border-radius:4px; border:1px solid #444; background:#2a2a2a; color:#eee;" />`
        }
        <input name="password" type="password" placeholder="Mot de passe" required minlength="8"
          style="padding:8px; border-radius:4px; border:1px solid #444; background:#2a2a2a; color:#eee;" />
        <button type="submit" style="padding:10px; border-radius:4px; border:none; background:#4dd0e1; color:#111; font-weight:bold; cursor:pointer;">
          ${isLogin ? "Se connecter" : "Créer un compte"}
        </button>
        <p id="auth-error" style="color:#ff6b6b; min-height:18px; margin:0; font-size:13px; text-align:center;"></p>
        <a id="auth-toggle" href="#" style="text-align:center; color:#4dd0e1; font-size:13px;">
          ${isLogin ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </a>
      </form>
    `;

    const form = this.container.querySelector("#auth-form") as HTMLFormElement;
    const errorEl = this.container.querySelector("#auth-error") as HTMLParagraphElement;
    const toggle = this.container.querySelector("#auth-toggle") as HTMLAnchorElement;

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      this.mode = isLogin ? "register" : "login";
      this.render();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.textContent = "";
      const data = new FormData(form);
      const username = String(data.get("username") ?? "");
      const password = String(data.get("password") ?? "");

      try {
        const auth = isLogin
          ? await login(username, password)
          : await register(username, String(data.get("email") ?? ""), password);
        this.destroy();
        this.onSuccess(auth);
      } catch (err) {
        errorEl.textContent = err instanceof Error ? err.message : "Erreur inconnue";
      }
    });
  }

  private destroy() {
    this.container.remove();
  }
}
