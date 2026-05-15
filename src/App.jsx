import { useState, useEffect } from “react”;

const TONES = [
{ value: “professional”, label: “Professionnel” },
{ value: “luxury”, label: “Luxe & Premium” },
{ value: “fun”, label: “Fun / Décontracté” },
{ value: “technical”, label: “Technique / Expert” },
{ value: “minimalist”, label: “Minimaliste & Épuré” },
];

const TONE_LABELS = {
professional: “Professionnel”,
luxury: “Luxe & Premium”,
fun: “Fun / Décontracté”,
technical: “Technique / Expert”,
minimalist: “Minimaliste & Épuré”,
};

const LEGAL_ITEMS = [
{
title: “Conditions d’utilisation”,
content: “PageCraft AI est un outil de génération de contenu à usage personnel et commercial. L’utilisation est libre et gratuite dans le cadre de projets e-commerce. Vous vous engagez à ne pas utiliser cet outil pour générer du contenu trompeur, frauduleux ou contraire aux conditions d’utilisation de Shopify. Vous restez seul responsable du contenu publié sur votre boutique.”,
},
{
title: “Conditions générales de service”,
content: “L’outil est fourni « en l’état », sans garantie de résultat. Les textes générés sont des suggestions basées sur l’intelligence artificielle : ils peuvent contenir des inexactitudes ou ne pas correspondre à votre produit réel. Une relecture humaine est fortement recommandée avant toute publication. Nous nous réservons le droit de modifier ou d’interrompre le service à tout moment.”,
},
{
title: “Propriété intellectuelle”,
content: “Le contenu généré (titres, descriptions, bullet points, balises SEO) appartient à l’utilisateur dès sa génération. PageCraft AI ne revendique aucun droit de propriété sur les textes produits. L’interface, le code source et le nom « PageCraft AI » sont protégés. Vous êtes libre d’utiliser, modifier et publier le contenu généré sans attribution obligatoire.”,
},
{
title: “Source des informations & Transparence IA”,
content: “Les textes sont générés par Claude, un modèle de langage développé par Anthropic (anthropic.com). Les informations de sortie sont basées uniquement sur les données que vous saisissez dans le formulaire — aucune information extérieure n’est consultée. Aucune donnée personnelle n’est stockée par cet outil. Les requêtes transitent directement vers l’API Anthropic via une connexion sécurisée (HTTPS).”,
},
{
title: “Données personnelles (RGPD)”,
content: “Cet outil ne collecte, ne stocke ni ne transfère aucune donnée personnelle. Les informations saisies dans le formulaire (nom du produit, prix, caractéristiques) sont transmises uniquement à l’API Anthropic pour la génération du contenu, conformément à leur politique de confidentialité disponible sur anthropic.com/privacy. Aucun cookie de suivi n’est utilisé.”,
},
{
title: “Limitation de responsabilité”,
content: “PageCraft AI ne saurait être tenu responsable des pertes commerciales, des suspensions de compte Shopify ou de tout préjudice résultant de l’utilisation du contenu généré. Il est de votre responsabilité de vérifier que le contenu publié est exact, conforme à votre produit réel et respecte les réglementations en vigueur (étiquetage, publicité mensongère, etc.).”,
},
];

function buildPrompt(form) {
return `You are a world-class e-commerce copywriter specializing in high-converting Shopify product pages.

Product name: ${form.name}
Price: ${form.price}
Category: ${form.category}
Key features: ${form.features}
Language: ${form.language}
Tone: ${TONE_LABELS[form.tone]}

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation — with this exact structure:
{
“title”: “optimized product title (compelling, SEO-friendly)”,
“tagline”: “short punchy tagline under 10 words”,
“description”: “2-3 sentences persuasive product description that sells the emotion and value”,
“bullets”: [“benefit-focused point 1”, “benefit-focused point 2”, “benefit-focused point 3”, “benefit-focused point 4”, “benefit-focused point 5”],
“meta_title”: “SEO meta title max 60 chars”,
“meta_description”: “SEO meta description max 155 chars”
}

Write everything in the language specified. The tone must be consistent and strong. Focus on benefits over features. Make it compelling and conversion-focused.`;
}

function buildHTML(data, form) {
return `<!-- ============================================================ -->

<!-- PAGE PRODUIT SHOPIFY — Générée par PageCraft AI              -->

<!-- Date : ${new Date().toLocaleDateString("fr-FR")}             -->

<!-- ============================================================ -->

<!-- ► SEO : Colle ces infos dans Shopify → Fiche produit → bas de page → "Référencement (SEO)" -->

<!-- Meta title    : ${data.meta_title} -->

<!-- Meta desc     : ${data.meta_description} -->

<!-- ► DESCRIPTION : Colle ce bloc dans Shopify → Fiche produit → champ "Description" → icône </> -->

<div class="product-content" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:640px;color:#1a1a1a;line-height:1.6;">

  <p style="font-size:0.8rem;letter-spacing:0.18em;text-transform:uppercase;color:#8a7a5a;margin:0 0 0.6rem;">${form.category}</p>

  <h1 style="font-size:2rem;font-weight:700;margin:0 0 0.4rem;line-height:1.2;color:#0d0d0d;">${data.title}</h1>

  <p style="font-size:1.05rem;font-style:italic;color:#5a5a5a;margin:0 0 1rem;">${data.tagline}</p>

  <p style="font-size:1.5rem;font-weight:700;color:#1a1a1a;margin:0 0 1.5rem;">${form.price}</p>

  <p style="font-size:1rem;color:#3a3a3a;margin:0 0 1.5rem;">${data.description}</p>

  <ul style="padding-left:1.2rem;margin:0 0 1.5rem;">
${data.bullets.map(b => `    <li style="margin-bottom:0.6rem;color:#3a3a3a;">${b}</li>`).join("\n")}
  </ul>

</div>`;
}

const inputStyle = {
background: “#faf9f7”,
border: “1px solid #e0d9cc”,
borderRadius: “6px”,
color: “#1a1a1a”,
padding: “0.75rem 1rem”,
fontSize: “0.95rem”,
fontFamily: “inherit”,
outline: “none”,
width: “100%”,
boxSizing: “border-box”,
transition: “border-color 0.2s, box-shadow 0.2s”,
};

export default function App() {
const [form, setForm] = useState({
name: “”, price: “”, category: “”, features: “”, language: “Français”, tone: “professional”,
});
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [activeTab, setActiveTab] = useState(“preview”);
const [copied, setCopied] = useState(false);
const [visible, setVisible] = useState(false);
const [modal, setModal] = useState(null);
const [freeUsed, setFreeUsed] = useState(() => {
try { return localStorage.getItem(“pagecraft_used”) === “true”; } catch { return false; }
});

const STRIPE_URL = “https://buy.stripe.com/9B63cu92UaNa6Xh3Eedwc09”;

useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

const handleChange = (e) => setForm({ …form, [e.target.name]: e.target.value });

const handleGenerate = async () => {
if (!form.name || !form.price || !form.category || !form.features) {
setError(“Merci de remplir tous les champs obligatoires.”);
return;
}
if (freeUsed) {
window.open(STRIPE_URL, “_blank”);
return;
}
setError(null);
setLoading(true);
setResult(null);
try {
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
messages: [{ role: “user”, content: buildPrompt(form) }],
}),
});
const data = await response.json();
const text = data.content.map(i => i.text || “”).join(””);
const clean = text.replace(/`json|`/g, “”).trim();
const parsed = JSON.parse(clean);
setResult({ …parsed, html: buildHTML(parsed, form) });
setActiveTab(“preview”);
setFreeUsed(true);
try { localStorage.setItem(“pagecraft_used”, “true”); } catch {}
} catch {
setError(“Une erreur est survenue. Vérifie ta connexion et réessaie.”);
} finally {
setLoading(false);
}
};

const handleCopy = () => {
if (result?.html) {
navigator.clipboard.writeText(result.html);
setCopied(true);
setTimeout(() => setCopied(false), 2500);
}
};

return (
<div style={{
minHeight: “100vh”,
background: “#f5f2ec”,
fontFamily: “‘Georgia’, ‘Times New Roman’, serif”,
color: “#1a1a1a”,
}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap'); * { box-sizing: border-box; } .fade-in { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; } .fade-in.visible { opacity: 1; transform: translateY(0); } .fade-in.d1 { transition-delay: 0.05s; } .fade-in.d2 { transition-delay: 0.15s; } .fade-in.d3 { transition-delay: 0.25s; } .fade-in.d4 { transition-delay: 0.35s; } .fade-in.d5 { transition-delay: 0.45s; } .fade-in.d6 { transition-delay: 0.55s; } .generate-btn:hover { background: #1a1a1a !important; } .tab-btn:hover { color: #8a7a5a !important; } input:focus, textarea:focus, select:focus { border-color: #8a7a5a !important; box-shadow: 0 0 0 3px rgba(138,122,90,0.12) !important; } .copy-btn:hover { background: #1a1a1a !important; color: #f5f2ec !important; } .section-divider { border: none; border-top: 1px solid #ddd6c8; margin: 0; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f5f2ec; } ::-webkit-scrollbar-thumb { background: #d0c9bc; border-radius: 3px; }`}</style>

```
  {/* ── NAV ── */}
  <nav style={{
    background: "#1a1a1a",
    padding: "0 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "#f5f2ec", fontWeight: 300, letterSpacing: "0.12em" }}>
        PageCraft
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#8a7a5a", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        AI
      </span>
    </div>
    <div style={{ display: "flex", gap: "2rem" }}>
      {["Outil", "Guide", "Légal"].map(item => (
        <a key={item} href={`#${item.toLowerCase()}`} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.75rem",
          color: "#999",
          textDecoration: "none",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>{item}</a>
      ))}
    </div>
  </nav>

  {/* ── HERO ── */}
  <section style={{
    background: "linear-gradient(160deg, #1a1a1a 0%, #2c2620 100%)",
    padding: "5rem 3rem 4rem",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "radial-gradient(circle at 20% 50%, rgba(138,122,90,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(138,122,90,0.06) 0%, transparent 50%)",
    }} />
    <div style={{ position: "relative", zIndex: 1 }}>
      <h1 className={`fade-in d2 ${visible ? "visible" : ""}`} style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
        fontWeight: 300, color: "#f5f2ec", margin: "0 0 1rem",
        lineHeight: 1.1, letterSpacing: "-0.01em",
      }}>
        Votre page produit Shopify,<br />
        <em style={{ fontStyle: "italic", color: "#c8b99a" }}>générée en quelques secondes.</em>
      </h1>
      <p className={`fade-in d3 ${visible ? "visible" : ""}`} style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "1.05rem", color: "#999", maxWidth: "540px",
        margin: "0 auto 2.5rem", lineHeight: 1.7,
      }}>
        Titre accrocheur, description persuasive, points clés, balises SEO et code HTML prêt à coller dans Shopify — sans aucune compétence technique.
      </p>
      <div className={`fade-in d4 ${visible ? "visible" : ""}`} style={{
        display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap",
      }}>
        {[["100%", "Gratuit"], ["< 10s", "Par génération"], ["✓", "Code Shopify inclus"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: "#c8b99a", fontWeight: 300 }}>{val}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#666", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.2rem" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* ── OUTIL ── */}
  <section id="outil" style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
    <div className={`fade-in d1 ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: "3rem" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.8rem" }}>
        Générateur
      </p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 300, margin: 0, color: "#1a1a1a" }}>
        Créer ma page produit
      </h2>
    </div>

    <div style={{
      display: "grid",
      gridTemplateColumns: result ? "1fr 1.3fr" : "1fr",
      gap: "2rem",
      maxWidth: result ? "100%" : "560px",
      margin: "0 auto",
      transition: "all 0.4s ease",
    }}>
      {/* Form */}
      <div style={{
        background: "#fff",
        border: "1px solid #e0d9cc",
        borderRadius: "12px",
        padding: "2.5rem",
        boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
      }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 2rem", color: "#1a1a1a" }}>
          Informations du produit
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          {[
            { name: "name", label: "Nom du produit *", placeholder: "Ex : Montre Oslo Classic" },
            { name: "price", label: "Prix *", placeholder: "Ex : 89,99 €" },
            { name: "category", label: "Catégorie *", placeholder: "Ex : Horlogerie, Mode, Beauté…" },
          ].map(f => (
            <div key={f.name}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                {f.label}
              </label>
              <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}

          <div>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Caractéristiques clés *
            </label>
            <textarea name="features" value={form.features} onChange={handleChange}
              placeholder="Ex : Boîtier acier inoxydable, étanche 50m, bracelet cuir véritable, mouvement quartz japonais"
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Langue
              </label>
              <input name="language" value={form.language} onChange={handleChange} placeholder="Français, English…" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Ton
              </label>
              <select name="tone" value={form.tone} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }}>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#c0392b", margin: 0, padding: "0.7rem 1rem", background: "#fdf2f0", borderRadius: "6px", border: "1px solid #f5c6c0" }}>
              {error}
            </p>
          )}

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#aaa", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            Le contenu est généré par l'IA. Vous restez responsable de la relecture et de la publication.
          </p>

          <button className="generate-btn" onClick={handleGenerate} disabled={loading} style={{
            background: loading ? "#999" : freeUsed ? "#8a7a5a" : "#1a1a1a",
            color: "#f5f2ec",
            border: "none",
            borderRadius: "6px",
            padding: "1rem",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            transition: "background 0.2s",
          }}>
            {loading ? "Génération en cours…" : freeUsed ? "✦ Accès illimité — 19,99 € →" : "✦ Générer ma page produit"}
          </button>

          {freeUsed && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#aaa", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
              Vous avez utilisé votre génération gratuite. Débloquez l'accès illimité pour continuer.
            </p>
          )}


        </div>
      </div>

      {/* Result */}
      {(result || loading) && (
        <div style={{
          background: "#fff",
          border: "1px solid #e0d9cc",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
        }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.2rem", padding: "3rem" }}>
              <div style={{
                width: "36px", height: "36px",
                border: "2px solid #e0d9cc", borderTop: "2px solid #8a7a5a",
                borderRadius: "50%", animation: "spin 0.9s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#999", letterSpacing: "0.1em" }}>
                Génération de votre page personnalisée…
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #e0d9cc", padding: "0 2rem" }}>
                {[["preview", "Aperçu"], ["code", "Code HTML"]].map(([key, label]) => (
                  <button key={key} className="tab-btn" onClick={() => setActiveTab(key)} style={{
                    background: "none", border: "none",
                    borderBottom: activeTab === key ? "2px solid #8a7a5a" : "2px solid transparent",
                    color: activeTab === key ? "#1a1a1a" : "#aaa",
                    padding: "1rem 1rem",
                    fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    transition: "color 0.2s",
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                {activeTab === "preview" && result && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>
                        Titre produit
                      </span>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 600, margin: "0.4rem 0 0", color: "#1a1a1a", lineHeight: 1.2 }}>
                        {result.title}
                      </h3>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", color: "#8a7a5a", margin: "0.4rem 0 0" }}>
                        {result.tagline}
                      </p>
                    </div>
                    <hr className="section-divider" />
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>
                        Description
                      </span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#444", lineHeight: 1.8, margin: "0.6rem 0 0" }}>
                        {result.description}
                      </p>
                    </div>
                    <hr className="section-divider" />
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>
                        Points clés
                      </span>
                      <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {result.bullets.map((b, i) => (
                          <li key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "#444", lineHeight: 1.6 }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <hr className="section-divider" />
                    <div style={{ background: "#faf9f7", borderRadius: "8px", padding: "1.2rem", border: "1px solid #e0d9cc" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>
                        Balises SEO
                      </span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#555", margin: "0.7rem 0 0.4rem" }}>
                        <strong style={{ color: "#1a1a1a" }}>Meta title :</strong> {result.meta_title}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#555", margin: 0 }}>
                        <strong style={{ color: "#1a1a1a" }}>Meta description :</strong> {result.meta_description}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "code" && result && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#999" }}>
                        Code HTML prêt à coller
                      </span>
                      <button className="copy-btn" onClick={handleCopy} style={{
                        background: copied ? "#2d6a4f" : "#1a1a1a",
                        color: "#f5f2ec",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0.5rem 1.2rem",
                        fontSize: "0.72rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "background 0.2s",
                      }}>
                        {copied ? "✓ Copié !" : "Copier le code"}
                      </button>
                    </div>
                    <pre style={{
                      background: "#1a1a1a",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      fontSize: "0.73rem",
                      lineHeight: 1.8,
                      color: "#c8b99a",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "'Courier New', monospace",
                    }}>
                      {result.html}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </section>

  {/* ── GUIDE SHOPIFY ── */}
  <section id="guide" style={{ background: "#1a1a1a", padding: "5rem 2rem" }}>
    <div style={{ maxWidth: "780px", margin: "0 auto" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.8rem", textAlign: "center" }}>
        Guide d'utilisation
      </p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 300, color: "#f5f2ec", textAlign: "center", margin: "0 0 3rem" }}>
        Comment coller le code dans Shopify
      </h2>

      {[
        {
          step: "01",
          title: "Copier le code HTML",
          desc: "Dans l'onglet « Code HTML » du résultat ci-dessus, cliquez sur « Copier le code » pour copier l'intégralité du bloc.",
        },
        {
          step: "02",
          title: "Ouvrir votre fiche produit Shopify",
          desc: "Connectez-vous à votre boutique Shopify. Allez dans Produits → Tous les produits → sélectionnez ou créez votre produit.",
        },
        {
          step: "03",
          title: "Coller la description",
          desc: "Dans le champ « Description », cherchez l'icône « </> » (ou « HTML ») dans la barre d'outils de l'éditeur. Cliquez dessus, supprimez le contenu existant, puis collez votre code.",
        },
        {
          step: "04",
          title: "Ajouter les balises SEO",
          desc: "Faites défiler jusqu'en bas de la fiche produit. Dans la section « Référencement (SEO) », copiez le Meta title et la Meta description indiqués dans les commentaires du code.",
        },
        {
          step: "05",
          title: "Enregistrer et vérifier",
          desc: "Cliquez sur « Enregistrer ». Prévisualisez votre produit (bouton « Voir »). Si le rendu ne vous convient pas, vous pouvez revenir en mode visuel et ajuster manuellement.",
        },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", gap: "1.8rem", marginBottom: "2.2rem",
          paddingBottom: "2.2rem",
          borderBottom: i < 4 ? "1px solid #2c2620" : "none",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem", color: "#8a7a5a", fontWeight: 300,
            minWidth: "3rem", lineHeight: 1,
          }}>
            {item.step}
          </div>
          <div>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "#f5f2ec", margin: "0 0 0.5rem", letterSpacing: "0.03em" }}>
              {item.title}
            </h4>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#888", margin: 0, lineHeight: 1.7 }}>
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>

  {/* ── LEGAL (compact) ── */}
  <section id="legal" style={{ background: "#f5f2ec", padding: "2.5rem 2rem", borderTop: "1px solid #e0d9cc" }}>
    <div style={{ maxWidth: "780px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.4rem 1.8rem" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#aaa", letterSpacing: "0.08em" }}>
        Informations légales :
      </span>
      {LEGAL_ITEMS.map((item) => (
        <button key={item.title} onClick={() => setModal(item)} style={{
          background: "none", border: "none", padding: 0,
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
          color: "#8a7a5a", cursor: "pointer",
          textDecoration: "underline", textUnderlineOffset: "3px",
          letterSpacing: "0.04em",
        }}>
          {item.title}
        </button>
      ))}
    </div>
  </section>

  {/* ── MODAL ── */}
  {modal && (
    <div onClick={() => setModal(null)} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,8,5,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1.5rem",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "12px", maxWidth: "540px", width: "100%",
        padding: "2.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        position: "relative", maxHeight: "80vh", overflowY: "auto",
      }}>
        <button onClick={() => setModal(null)} style={{
          position: "absolute", top: "1.2rem", right: "1.2rem",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "1.2rem", color: "#aaa", lineHeight: 1,
        }}>✕</button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.6rem" }}>
          Informations légales
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 1.2rem", lineHeight: 1.2 }}>
          {modal.title}
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#555", margin: 0, lineHeight: 1.9 }}>
          {modal.content}
        </p>
      </div>
    </div>
  )}

  {/* ── FOOTER ── */}
  <footer style={{
    background: "#1a1a1a",
    padding: "2.5rem 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#f5f2ec", fontWeight: 300, letterSpacing: "0.12em" }}>
        PageCraft
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "#8a7a5a", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        AI
      </span>
    </div>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#555", margin: 0 }}>
      © {new Date().getFullYear()} PageCraft AI
    </p>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#555", margin: 0 }}>
      Contenu généré par IA — à relire avant publication
    </p>
  </footer>
</div>
```

);
}
