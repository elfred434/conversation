import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { useApp } from '../state/store'

/** Conditions d'utilisation et politique de confidentialite — sans jargon juridique. */
export default function Legal(): JSX.Element {
  const { go } = useApp()
  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title center">Informations légales</h1>
      <p className="subtitle center">
        Ce que fait FluentFlow, ce qui reste sur ton appareil, ce qui ne l'est pas — en clair.
      </p>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
          <FileText size={18} /> Conditions d'utilisation
        </h2>
        <ul className="rule-lines">
          <li>FluentFlow est un site d'apprentissage de l'anglais, offert gratuitement, sans compte ni installation.</li>
          <li>Le site est fourni « en l'état », à but éducatif : il ne remplace pas un examen officiel ou un enseignant.</li>
          <li>Les contenus embarqués (leçons, grammaire, fiches, mots) sont rédigés pour le site ; les contenus demandés à une IA peuvent contenir des erreurs — vérifie ce que tu apprends.</li>
          <li>Tu es seul responsable des clés API que tu ajoutes dans Paramètres : n'utilise que les tiennes, ne les partage pas.</li>
          <li>Tu es invité à utiliser le site dans le respect de la loi de ton pays.</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
          <ShieldCheck size={18} /> Politique de confidentialité
        </h2>
        <ul className="rule-lines">
          <li>Pas de compte, pas de serveur : FluentFlow ne collecte et ne stocke rien sur un serveur.</li>
          <li>Ta progression, tes sessions et tes réglages restent dans le stockage local de ton navigateur (clés « ff_ »). Tu peux tout effacer depuis Paramètres.</li>
          <li>Les clés API que tu ajoutes restent dans ton navigateur et ne sont envoyées qu'au fournisseur que tu as choisi, uniquement quand tu utilises une fonction IA.</li>
          <li>Deux fonctions optionnelles interrogent des services publics sans clé : le dictionnaire (dictionaryapi.dev) et la traduction de secours (MyMemory) — seule la requête est envoyée, jamais ton identité.</li>
          <li>La voix (synthèse et reconnaissance) utilise les technologies intégrées à ton appareil ; l'option « IA intégrée au navigateur » télécharge un modèle sur ton appareil et fonctionne hors-ligne.</li>
          <li>Aucun traceur publicitaire, aucune vente de données : il n'y a rien à vendre, il n'y a pas de compte.</li>
        </ul>
      </div>

      <p className="muted center" style={{ fontSize: '0.85rem' }}>
        Dernière mise à jour : septembre 2026.
      </p>
    </div>
  )
}
