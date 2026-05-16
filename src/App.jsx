import { useState, useEffect } from “react”;

const TONES = [
{ value: “professional”, label: “Professionnel” },
{ value: “luxury”, label: “Luxe & Premium” },
{ value: “fun”, label: “Fun / Decontracte” },
{ value: “technical”, label: “Technique / Expert” },
{ value: “minimalist”, label: “Minimaliste & Epure” },
];

const TONE_LABELS = {
professional: “Professionnel”,
luxury: “Luxe & Premium”,
fun: “Fun / Decontracte”,
technical: “Technique / Expert”,
minimalist: “Minimaliste & Epure”,
};

const LEGAL_ITEMS = [
{
title: “Conditions d’utilisation”,
content: “PageCraft AI est un outil de generation de contenu a usage personnel et commercial. L’utilisation est libre et gratuite dans le cadre de projets e-commerce. Vous vous engagez a ne pas utiliser cet outil pour generer du contenu trompeur, frauduleux ou contraire aux conditions d’utilisation de Shopify. Vous restez seul responsable du contenu publie sur votre boutique.”,
},
{
title: “Conditions generales de service”,
content: “L’outil est fourni en l’etat, sans garantie de resultat. Les textes generes sont des suggestions basees sur l’intelligence artificielle : ils peuvent contenir des inexactitudes ou ne pas correspondre a votre produit reel. Une relecture humaine est fortement recommandee avant toute publication. Nous nous reservons le droit de modifier ou d’interrompre le service a tout moment.”,
},
{
title: “Propriete intellectuelle”,
content: “Le contenu genere (titres, descriptions, bullet points, balises SEO) appartient a l’utilisateur des sa generation. PageCraft AI ne revendique aucun droit de propriete sur les textes produits. L’interface, le code source et le nom PageCraft AI sont proteges. Vous etes libre d’utiliser, modifier et publier le contenu genere sans attribution obligatoire.”,
},
{
title: “Source des informations & Transparence IA”,
content: “Les textes sont generes par une intelligence artificielle. Les informations de sortie sont basees uniquement sur les donnees que vous saisissez dans le formulaire. Aucune donnee personnelle n’est stockee par cet outil. Les requetes transitent via une connexion securisee (HTTPS).”,
},
{
title: “Donnees personnelles (RGPD)”,
content: “Cet outil ne collecte, ne stocke ni ne transfere aucune donnee personnelle. Les informations saisies dans le formulaire sont transmises uniquement pour la generation du contenu. Aucun cookie de suivi n’est utilise.”,
},
{
title: “Limitation de responsabilite”,
content: “PageCraft AI ne saurait etre tenu responsable des pertes commerciales, des suspensions de compte Shopify ou de tout prejudice resultant de l’utilisation du contenu genere. Il est de votre responsabilite de verifier que le contenu publie est exact et conforme aux reglementations en vigueur.”,
},
];

function buildPrompt(form) {
return “You are a world-class e-commerce copywriter specializing in high-converting Shopify product pages.\n\nProduct name: “ + form.name + “\nPrice: “ + form.price + “\nCategory: “ + form.category + “\nKey features: “ + form.features + “\nLanguage: “ + form.language + “\nTone: “ + TONE_LABELS[form.tone] + “\n\nRespond ONLY with a valid JSON object — no markdown, no backticks, no explanation — with this exact structure:\n{\n  "title": "optimized product title",\n  "tagline": "short punchy tagline under 10 words",\n  "description": "2-3 sentences persuasive product description",\n  "bullets": ["point 1", "point 2", "point 3", "point 4", "point 5"],\n  "meta_title": "SEO meta title max 60 chars",\n  "meta_description": "SEO meta description max 155 chars"\n}\n\nWrite everything in the language specified. Focus on benefits over features.”;
}

function buildHTML(data, form) {
var bullets = data.bullets.map(function(b) {
return “    <li style="margin-bottom:0.6rem;color:#3a3a3a;">” + b + “</li>”;
}).join(”\n”);
return “<!-- PAGE PRODUIT SHOPIFY - Generee par PageCraft AI -->\n<!-- Date : " + new Date().toLocaleDateString("fr-FR") + " -->\n<!-- Meta title : " + data.meta_title + " -->\n<!-- Meta desc  : " + data.meta_description + " -->\n\n<div class="product-content" style="font-family:‘Helvetica Neue’,Helvetica,Arial,sans-serif;max-width:640px;color:#1a1a1a;line-height:1.6;">\n  <p style="font-size:0.8rem;letter-spacing:0.18em;text-transform:uppercase;color:#8a7a5a;margin:0 0 0.6rem;">” + form.category + “</p>\n  <h1 style="font-size:2rem;font-weight:700;margin:0 0 0.4rem;line-height:1.2;color:#0d0d0d;">” + data.title + “</h1>\n  <p style="font-size:1.05rem;font-style:italic;color:#5a5a5a;margin:0 0 1rem;">” + data.tagline + “</p>\n  <p style="font-size:1.5rem;font-weight:700;color:#1a1a1a;margin:0 0 1.5rem;">” + form.price + “</p>\n  <p style="font-size:1rem;color:#3a3a3a;margin:0 0 1.5rem;">” + data.description + “</p>\n  <ul style="padding-left:1.2rem;margin:0 0 1.5rem;">\n” + bullets + “\n  </ul>\n</div>”;
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
name: “”, price: “”, category: “”, features: “”, language: “Francais”, tone: “professional”,
});
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [activeTab, setActiveTab] = useState(“preview”);
const [copied, setCopied] = useState(false);
const [visible, setVisible] = useState(false);
const [modal, setModal] = useState(null);
const [freeUsed, setFreeUsed] = useState(function() {
try { return localStorage.getItem(“pagecraft_used”) === “true”; } catch(e) { return false; }
});

var STRIPE_URL = “https://buy.stripe.com/9B63cu92UaNa6Xh3Eedwc09”;

useEffect(function() { setTimeout(function() { setVisible(true); }, 80); }, []);

function handleChange(e) {
setForm(Object.assign({}, form, { [e.target.name]: e.target.value }));
}

async function handleGenerate() {
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
var response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
messages: [{ role: “user”, content: buildPrompt(form) }],
}),
});
var data = await response.json();
var text = data.content.map(function(i) { return i.text || “”; }).join(””);
var clean = text.replace(/`json|`/g, “”).trim();
var parsed = JSON.parse(clean);
setResult(Object.assign({}, parsed, { html: buildHTML(parsed, form) }));
setActiveTab(“preview”);
setFreeUsed(true);
try { localStorage.setItem(“pagecraft_used”, “true”); } catch(e) {}
} catch(e) {
setError(“Une erreur est survenue. Verifie ta connexion et reessaie.”);
} finally {
setLoading(false);
}
}

function handleCopy() {
if (result && result.html) {
navigator.clipboard.writeText(result.html);
setCopied(true);
setTimeout(function() { setCopied(false); }, 2500);
}
}

return (
<div style={{ minHeight: “100vh”, background: “#f5f2ec”, fontFamily: “‘Georgia’, ‘Times New Roman’, serif”, color: “#1a1a1a” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap'); * { box-sizing: border-box; } .fade-in { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; } .fade-in.visible { opacity: 1; transform: translateY(0); } .fade-in.d1 { transition-delay: 0.05s; } .fade-in.d2 { transition-delay: 0.15s; } .fade-in.d3 { transition-delay: 0.25s; } .fade-in.d4 { transition-delay: 0.35s; } .generate-btn:hover { background: #1a1a1a !important; } .tab-btn:hover { color: #8a7a5a !important; } input:focus, textarea:focus, select:focus { border-color: #8a7a5a !important; box-shadow: 0 0 0 3px rgba(138,122,90,0.12) !important; } .copy-btn:hover { background: #1a1a1a !important; color: #f5f2ec !important; } .section-divider { border: none; border-top: 1px solid #ddd6c8; margin: 0; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f5f2ec; } ::-webkit-scrollbar-thumb { background: #d0c9bc; border-radius: 3px; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

```
  <nav style={{ background: "#1a1a1a", padding: "0 3rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "#f5f2ec", fontWeight: 300, letterSpacing: "0.12em" }}>PageCraft</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#8a7a5a", letterSpacing: "0.18em", textTransform: "uppercase" }}>AI</span>
    </div>
    <div style={{ display: "flex", gap: "2rem" }}>
      {["Outil", "Guide", "Legal"].map(function(item) {
        return (
          <a key={item} href={"#" + item.toLowerCase()} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#999", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item}</a>
        );
      })}
    </div>
  </nav>

  <section style={{ background: "linear-gradient(160deg, #1a1a1a 0%, #2c2620 100%)", padding: "5rem 3rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(138,122,90,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(138,122,90,0.06) 0%, transparent 50%)" }} />
    <div style={{ position: "relative", zIndex: 1 }}>
      <h1 className={"fade-in d2 " + (visible ? "visible" : "")} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "#f5f2ec", margin: "0 0 1rem", lineHeight: 1.1 }}>
        Votre page produit Shopify,<br />
        <em style={{ fontStyle: "italic", color: "#c8b99a" }}>generee en quelques secondes.</em>
      </h1>
      <p className={"fade-in d3 " + (visible ? "visible" : "")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.05rem", color: "#999", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
        Titre accrocheur, description persuasive, points cles, balises SEO et code HTML pret a coller dans Shopify.
      </p>
      <div className={"fade-in d4 " + (visible ? "visible" : "")} style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
        {[["100%", "Gratuit"], ["< 10s", "Par generation"], ["OK", "Code Shopify inclus"]].map(function(item) {
          return (
            <div key={item[1]} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: "#c8b99a", fontWeight: 300 }}>{item[0]}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#666", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.2rem" }}>{item[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  </section>

  <section id="outil" style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
    <div className={"fade-in d1 " + (visible ? "visible" : "")} style={{ textAlign: "center", marginBottom: "3rem" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.8rem" }}>Generateur</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 300, margin: 0, color: "#1a1a1a" }}>Creer ma page produit</h2>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.3fr" : "1fr", gap: "2rem", maxWidth: result ? "100%" : "560px", margin: "0 auto" }}>
      <div style={{ background: "#fff", border: "1px solid #e0d9cc", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 2rem", color: "#1a1a1a" }}>Informations du produit</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          {[
            { name: "name", label: "Nom du produit *", placeholder: "Ex : Montre Oslo Classic" },
            { name: "price", label: "Prix *", placeholder: "Ex : 89,99 EUR" },
            { name: "category", label: "Categorie *", placeholder: "Ex : Horlogerie, Mode, Beaute..." },
          ].map(function(f) {
            return (
              <div key={f.name}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
              </div>
            );
          })}

          <div>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Caracteristiques cles *</label>
            <textarea name="features" value={form.features} onChange={handleChange} placeholder="Ex : Boitier acier inoxydable, etanche 50m, bracelet cuir veritable" rows={3} style={Object.assign({}, inputStyle, { resize: "vertical" })} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Langue</label>
              <input name="language" value={form.language} onChange={handleChange} placeholder="Francais, English..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Ton</label>
              <select name="tone" value={form.tone} onChange={handleChange} style={Object.assign({}, inputStyle, { cursor: "pointer" })}>
                {TONES.map(function(t) { return <option key={t.value} value={t.value}>{t.label}</option>; })}
              </select>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#c0392b", margin: 0, padding: "0.7rem 1rem", background: "#fdf2f0", borderRadius: "6px", border: "1px solid #f5c6c0" }}>{error}</p>
          )}

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#aaa", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            Le contenu est genere par l'IA. Vous restez responsable de la relecture et de la publication.
          </p>

          <button className="generate-btn" onClick={handleGenerate} disabled={loading} style={{ background: loading ? "#999" : freeUsed ? "#8a7a5a" : "#1a1a1a", color: "#f5f2ec", border: "none", borderRadius: "6px", padding: "1rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "background 0.2s" }}>
            {loading ? "Generation en cours..." : freeUsed ? "Acces illimite - 19,99 EUR" : "Generer ma page produit"}
          </button>

          {freeUsed && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#aaa", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
              Vous avez utilise votre generation gratuite. Debloquez l'acces illimite pour continuer.
            </p>
          )}
        </div>
      </div>

      {(result || loading) && (
        <div style={{ background: "#fff", border: "1px solid #e0d9cc", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.2rem", padding: "3rem" }}>
              <div style={{ width: "36px", height: "36px", border: "2px solid #e0d9cc", borderTop: "2px solid #8a7a5a", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#999", letterSpacing: "0.1em" }}>Generation de votre page personnalisee...</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", borderBottom: "1px solid #e0d9cc", padding: "0 2rem" }}>
                {[["preview", "Apercu"], ["code", "Code HTML"]].map(function(tab) {
                  return (
                    <button key={tab[0]} className="tab-btn" onClick={function() { setActiveTab(tab[0]); }} style={{ background: "none", border: "none", borderBottom: activeTab === tab[0] ? "2px solid #8a7a5a" : "2px solid transparent", color: activeTab === tab[0] ? "#1a1a1a" : "#aaa", padding: "1rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}>{tab[1]}</button>
                  );
                })}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                {activeTab === "preview" && result && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>Titre produit</span>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 600, margin: "0.4rem 0 0", color: "#1a1a1a", lineHeight: 1.2 }}>{result.title}</h3>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", color: "#8a7a5a", margin: "0.4rem 0 0" }}>{result.tagline}</p>
                    </div>
                    <hr className="section-divider" />
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>Description</span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#444", lineHeight: 1.8, margin: "0.6rem 0 0" }}>{result.description}</p>
                    </div>
                    <hr className="section-divider" />
                    <div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>Points cles</span>
                      <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {result.bullets.map(function(b, i) { return <li key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "#444", lineHeight: 1.6 }}>{b}</li>; })}
                      </ul>
                    </div>
                    <hr className="section-divider" />
                    <div style={{ background: "#faf9f7", borderRadius: "8px", padding: "1.2rem", border: "1px solid #e0d9cc" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase" }}>Balises SEO</span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#555", margin: "0.7rem 0 0.4rem" }}><strong style={{ color: "#1a1a1a" }}>Meta title :</strong> {result.meta_title}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#555", margin: 0 }}><strong style={{ color: "#1a1a1a" }}>Meta description :</strong> {result.meta_description}</p>
                    </div>
                  </div>
                )}

                {activeTab === "code" && result && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#999" }}>Code HTML pret a coller</span>
                      <button className="copy-btn" onClick={handleCopy} style={{ background: copied ? "#2d6a4f" : "#1a1a1a", color: "#f5f2ec", border: "none", borderRadius: "5px", padding: "0.5rem 1.2rem", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}>
                        {copied ? "Copie !" : "Copier le code"}
                      </button>
                    </div>
                    <pre style={{ background: "#1a1a1a", borderRadius: "8px", padding: "1.5rem", fontSize: "0.73rem", lineHeight: 1.8, color: "#c8b99a", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "'Courier New', monospace" }}>
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

  <section id="guide" style={{ background: "#1a1a1a", padding: "5rem 2rem" }}>
    <div style={{ maxWidth: "780px", margin: "0 auto" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.8rem", textAlign: "center" }}>Guide d'utilisation</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 300, color: "#f5f2ec", textAlign: "center", margin: "0 0 3rem" }}>Comment coller le code dans Shopify</h2>
      {[
        { step: "01", title: "Copier le code HTML", desc: "Dans l'onglet Code HTML du resultat, cliquez sur Copier le code pour copier l'integralite du bloc." },
        { step: "02", title: "Ouvrir votre fiche produit Shopify", desc: "Connectez-vous a votre boutique Shopify. Allez dans Produits, Tous les produits, selectionnez ou creez votre produit." },
        { step: "03", title: "Coller la description", desc: "Dans le champ Description, cherchez l'icone </> ou HTML dans la barre d'outils. Cliquez dessus, supprimez le contenu existant, puis collez votre code." },
        { step: "04", title: "Ajouter les balises SEO", desc: "Faites defiler jusqu'en bas de la fiche produit. Dans la section Referencement (SEO), copiez le Meta title et la Meta description indiques dans les commentaires du code." },
        { step: "05", title: "Enregistrer et verifier", desc: "Cliquez sur Enregistrer. Previsualisez votre produit (bouton Voir). Si le rendu ne vous convient pas, vous pouvez revenir en mode visuel et ajuster manuellement." },
      ].map(function(item, i) {
        return (
          <div key={i} style={{ display: "flex", gap: "1.8rem", marginBottom: "2.2rem", paddingBottom: "2.2rem", borderBottom: i < 4 ? "1px solid #2c2620" : "none" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#8a7a5a", fontWeight: 300, minWidth: "3rem", lineHeight: 1 }}>{item.step}</div>
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "#f5f2ec", margin: "0 0 0.5rem" }}>{item.title}</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#888", margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  </section>

  <section id="legal" style={{ background: "#f5f2ec", padding: "2.5rem 2rem", borderTop: "1px solid #e0d9cc" }}>
    <div style={{ maxWidth: "780px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.4rem 1.8rem" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#aaa", letterSpacing: "0.08em" }}>Informations legales :</span>
      {LEGAL_ITEMS.map(function(item) {
        return (
          <button key={item.title} onClick={function() { setModal(item); }} style={{ background: "none", border: "none", padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#8a7a5a", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", letterSpacing: "0.04em" }}>
            {item.title}
          </button>
        );
      })}
    </div>
  </section>

  {modal && (
    <div onClick={function() { setModal(null); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,8,5,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#fff", borderRadius: "12px", maxWidth: "540px", width: "100%", padding: "2.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative", maxHeight: "80vh", overflowY: "auto" }}>
        <button onClick={function() { setModal(null); }} style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "1.2rem", color: "#aaa", lineHeight: 1 }}>X</button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "#8a7a5a", textTransform: "uppercase", margin: "0 0 0.6rem" }}>Informations legales</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 1.2rem", lineHeight: 1.2 }}>{modal.title}</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#555", margin: 0, lineHeight: 1.9 }}>{modal.content}</p>
      </div>
    </div>
  )}

  <footer style={{ background: "#1a1a1a", padding: "2.5rem 3rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#f5f2ec", fontWeight: 300, letterSpacing: "0.12em" }}>PageCraft</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "#8a7a5a", letterSpacing: "0.18em", textTransform: "uppercase" }}>AI</span>
    </div>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#555", margin: 0 }}>
      {"© " + new Date().getFullYear() + " PageCraft AI"}
    </p>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#555", margin: 0 }}>
      Contenu genere par IA - a relire avant publication
    </p>
  </footer>
</div>
```

);
}
