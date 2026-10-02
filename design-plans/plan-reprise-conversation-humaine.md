# Plan de reprise : un portfolio comme entrée en conversation

Mis à jour le 2 octobre 2026. Ce fichier suffit à reprendre le travail sans accéder à la conversation précédente. Lire aussi `AGENTS.md` et `PRODUCT.md` avant toute modification.

## Dernière décision d’Alexandre : le visuel reste à reprendre

Alexandre a indiqué ne pas aimer le design actuel. La disposition et le style de l’accueil intégré ne sont donc pas approuvés comme résultat final. Ne pas polir cette proposition en la prenant pour la direction choisie. Reprendre la réflexion visuelle avec lui, petit à petit, en gardant comme hypothèses à revisiter l’idée de la conversation humaine et la photo à côté du nom. Le terminal reste une piste qu’il n’aime pas.

Les choix techniques et les limites de sécurité ci-dessous sont à conserver pour la prochaine itération, sauf indication contraire. Le texte FR/EN qui suit a été accepté dans l’aperçu seulement ; il faut le revoir avec Alexandre avant d’en faire la rédaction finale du site.

## Intention d’Alexandre

Reprendre progressivement le portfolio ask-dev existant. L’accueil s’inspire de la simplicité d’une interface de chat : le visiteur découvre Alexandre en lui posant directement une question. Le destinataire est Alexandre Tostivint, une personne réelle qui répond personnellement en différé. Aucun chatbot ni réponse générée n’est prévu dans cette direction.

Public principal : recruteurs tech, CTO et managers. Le parcours et le CV doivent rester accessibles sans écrire de message. La conversation doit expliquer son intérêt et son fonctionnement avant le champ, sans laisser attendre une réponse instantanée.

## Décisions acceptées

- Faire d’abord un aperçu développé et isolé. Alexandre a ensuite explicitement demandé l’intégration de cet accueil au site local, sans publier, avec des agents Luna.
- Garder le fond sombre, l’accent bleu et le réseau existants.
- Placer la petite photo réelle fournie à côté du nom et du rôle.
- Présenter la disponibilité en texte simple. Alexandre n’aime pas le bandeau terminal.
- Donner la place principale à la conversation, avec une action d’envoi explicitement nommée.
- Conserver les liens directs vers CV, LinkedIn et email, ainsi que les deux suggestions recrutement/projet.
- Les suggestions remplissent uniquement un brouillon vide ; Entrée ajoute une ligne.
- Expliquer que la réponse est humaine et en différé, sans délai chiffré inventé.
- Garder une parité FR/EN et l’architecture statique HTML/CSS/JavaScript.

### Texte FR proposé puis accepté pour cet aperçu

**Le plus simple pour me connaître ? Me poser une question.**

Je suis Alexandre, architecte cloud. Une question technique, un projet ou un poste à proposer ? Écrivez-moi ici : je vous réponds personnellement.

Une vraie conversation, avec une réponse en différé.

### Adaptation EN dans l’aperçu

**The easiest way to get to know me? Ask me a question.**

I’m Alexandre, a cloud architect. A technical question, a project or a job opportunity? Write to me here: I reply personally.

A real conversation, with a reply when I’m available.

## État du dépôt et fichiers

L’accueil intégré et ses docs/tests sont développés à partir de `main` (`63b8f8e`). Alexandre a autorisé le push de cette intégration vers une branche de développement, ainsi que celui de la branche d’archive `codex/archive-portfolio-portail-20261002` (commit `6e40714`). La branche d’archive conserve l’ancienne refonte large comme référence, pas comme le plan à reprendre automatiquement. Le branchement local pour ce push est `codex/dev-portfolio-conversation-20261002`.

| Fichier | Rôle |
| --- | --- |
| `preview/compact/index.html` | Accueil de démonstration FR |
| `preview/compact/en/index.html` | Accueil de démonstration EN |
| `preview/compact/styles.css` | Composition compacte et responsive |
| `preview/compact/preview.js` | Interactions locales, sans transmission |
| `preview/compact/network.js` | Réseau corrigé repris de la branche d’archive |
| `preview/compact/README.md` | Utilisation et résultats de vérification |
| `index.html`, `en/index.html`, `styles.css` | Nouvel accueil intégré, autres vues conservées, composeur partagé dans Contact |
| `app.js` | Navigation Alpine et envoi Crisp après action explicite, sans faux succès |
| `bg-network.js` | Réseau de l’accueil uniquement, arrêt manuel et mouvement réduit |
| `tests/compact-home.test.js`, `tests/network-integration.test.js` | Tests Node avec Crisp et navigateur simulés |

L’aperçu et le site intégré réutilisent les portraits `alexandre-portrait-a.webp` / `.jpg`. Aucune nouvelle dépendance, aucun framework ni étape de build n’ont été ajoutés. Le site intégré conserve Alpine local.

**Important : l’intégration, les tests, les fichiers d’aperçu et ce plan sont les changements proposés sur la branche de développement.** La branche d’archive n’inclut pas ce nouvel accueil. Les fichiers locaux d’outils (skills) et de références de design ne font pas partie de ce changement.

### Ouvrir l’aperçu

Depuis la racine du dépôt, dans PowerShell :

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Si le serveur tourne déjà, il suffit d’ouvrir :

- FR : `http://127.0.0.1:8765/preview/compact/`
- EN : `http://127.0.0.1:8765/preview/compact/en/`
- Site intégré FR : `http://127.0.0.1:8765/`
- Site intégré EN : `http://127.0.0.1:8765/en/`

Ne pas ouvrir seulement le fichier HTML : utiliser le serveur pour tester les chemins et le comportement réels.

## Contrat de l’aperçu

Le bouton ne transmet aucun message et ne charge pas Crisp. Il affiche clairement que rien n’a été transmis et conserve le brouillon. La mention d’aperçu reste visible pour éviter une fausse promesse. Sans JavaScript, les champs et boutons de démonstration sont désactivés ; la photo, les textes et les liens directs restent disponibles.

Le réseau peut être arrêté depuis un contrôle visible. Avec `prefers-reduced-motion`, il est statique et ne programme pas de nouvelle frame. Il se suspend lorsque l’onglet est caché.

## Contrat du site intégré

Le site racine utilise le vrai flux Crisp existant, avec son identifiant public conservé. Le service ne se charge qu’après un envoi ou une ouverture explicite du chat. Les vérifications utilisent exclusivement des simulations ou un blocage réseau, sans message réel.

Accueil et Contact ont des champs distincts mais partagent `input`, `sending`, `sendState` et `sendStatus`. Le bouton ne peut pas envoyer deux fois pendant une tentative. Le brouillon n’est effacé qu’après un événement `message:sent` de Crisp correspondant au texte soumis, et uniquement s’il n’a pas été modifié depuis. Cet événement confirme l’envoi côté SDK, pas une lecture ou une réponse d’Alexandre.

Après quatre secondes sans chargement, le brouillon est conservé et les liens directs restent accessibles. Un chargement réussi plus tard ne rejoue pas la tentative échouée. Après une absence de confirmation, le même texte n’est pas renvoyé automatiquement ; une action « Ouvrir le chat » permet de vérifier la conversation. Aucun délai de réponse chiffré n’est promis.

Routes conservées : `#home`, `#about`, `#testimonials`, `#contact`, ainsi que les sections `#certs`, `#parcours`, `#projects`, `#project-finops` et `#ab-hist` dans À propos. Précédent/suivant, changement de langue vers la même route et focus après navigation sont gérés. Les chiffres du parcours restent immédiatement lisibles. Les anciens faux résultats de commandes et suggestions à envoi automatique ont été retirés du flux.

Le pied de page ne contient plus le nom interne de l’assistant ni la fausse affirmation sur les cookies. Les boutons existants à fond bleu ont été corrigés pour le contraste et les petites cibles secondaires agrandies à 44 px, sans changer leurs contenus professionnels.

## Piste à décider : « Model card »

Alexandre a proposé de remplacer le nom CV par « Model card ». Aucun changement de libellé n’est encore approuvé ni appliqué. Proposition à discuter : conserver « Voir le CV » pour les recruteurs, et essayer « Model card humaine » comme présentation secondaire du profil pour un public tech.

Le terme désigne à l’origine une documentation des usages, performances et limites d’un modèle de machine learning ([référence Google Research](https://research.google/pubs/model-cards-for-model-reporting/)). Son emploi ici serait un clin d’œil explicite. Éviter qu’il fasse croire que le visiteur échange avec une IA. Les rubriques et les éventuelles formulations personnelles devront être fournies ou approuvées par Alexandre, sans faits inventés.

## Étapes pour continuer

1. **Examiner cet aperçu avec Alexandre.** Vérifier qu’on comprend immédiatement à qui on écrit, pourquoi écrire et que la réponse n’est pas instantanée. Ajuster petit à petit ; présenter tout nouveau texte professionnel avant insertion.
2. **Décider de « Model card ».** Tester la compréhension du libellé et décider si le clin d’œil appartient au lien ou à une page secondaire. Ne pas changer le CV existant sans décision.
3. **Intégration locale réalisée.** Seule la composition validée a été reprise en FR/EN, avec le composeur partagé dans Contact. Ne pas fusionner toute l’archive ni relancer la refonte globale par défaut.
4. **Flux d’envoi adapté localement.** Le simulateur `preview.js` reste dans l’aperçu seulement. Le vrai SDK est utilisé après action explicite dans le site intégré, avec protection contre les doublons et erreurs honnêtes. La connexion réelle n’a pas été vérifiée par un envoi ; si une vérification réelle est demandée, obtenir une autorisation pour ce message précis. Les commandes locales ne sont pas retenues dans cette étape.
5. **Vérifications réalisées sur le site local.** La matrice FR/EN à 320, 390, 768 et 1440 px couvre les quatre vues existantes. Les scripts et rapports détaillés sont indiqués ci-dessous. Après un changement, relancer uniquement les vérifications concernées ; utiliser des simulations pour les cas Crisp, aucun message réel de test sans autorisation.
6. **Push demandé par Alexandre.** Pousser la branche de développement et la branche d’archive vers `origin`, sans intégrer à `main`, modifier le dépôt production ou déployer le site.

## Points à vérifier avant une future intégration

- Les instructions actuelles d’Alexandre et `AGENTS.md` priment sur les décisions historiques, notamment pour les noms internes et l’approbation des textes. La structure des vues secondaires n’a pas été refondue dans cette étape.
- Le total historique de neuf certifications et la mention de six actives ne doivent pas être mélangés sans clarification. L’aperçu n’ajoute aucun chiffre.
- Les témoignages de démonstration présents dans l’ancien site ne doivent pas être présentés comme des témoignages réels.
- Ne pas générer d’image, inventer un délai de réponse, une statistique, un témoignage ou un succès d’envoi.

## Vérification et traces locales

Les captures et rapports se trouvent dans `design-plans/validation/` (ignoré par Git). `integrated-browser-check.cjs` et `integrated-final-check.cjs` vérifient le site intégré ; `compact-preview-check.cjs` et `compact-final-check.cjs` restent pour l’aperçu isolé. Ils utilisent un Playwright local et Edge ; leurs chemins de cache sont propres à cette machine et doivent être adaptés ailleurs.

Pour lancer les tests reproductibles, sans dépendance supplémentaire ni serveur :

```powershell
node --test
```

Résultats locaux du 2 octobre 2026 :

- 18 tests Node passent, avec Crisp entièrement simulé.
- 32 rendus passent : les quatre vues existantes en FR/EN à 320, 390, 768 et 1440 px, sans débordement et avec des cibles d’au moins 44 px.
- Axe ne signale aucune violation sur les quatre vues dans les deux langues à 390 px.
- Le brouillon partagé, les suggestions sans envoi, Entrée pour une ligne, l’historique, le changement de langue et les erreurs en cas de blocage du script ont été vérifiés dans Edge.
- Aucun script tiers ne se charge lors de la consultation ou des suggestions. Les essais d’envoi bloquent le réseau externe et gardent le texte.
- Arrêt manuel et passage à une autre vue : aucune nouvelle frame après suspension. Mouvement réduit : zéro frame initiale ; le réseau reprend quand la préférence système revient.
- Les liens directs et les textes restent disponibles sans JavaScript ; les composeurs sont désactivés.
- Captures principales : `integrated-fr-home-1440.png`, `integrated-fr-home-390.png`, puis `integrated-fr-about-*` et `integrated-fr-contact-*` dans le dossier de validation.

Ces résultats concernent le rendu local et des services simulés ou bloqués. Ils ne prouvent pas qu’un message réel atteint la boîte d’Alexandre.

Pour les scripts de rendu local, démarrer le serveur puis fournir le chemin d’un module Playwright disponible en second argument de Node, par exemple `node design-plans/validation/integrated-browser-check.cjs <chemin-vers-playwright>`. Les fichiers de test du dépôt ne dépendent pas de ce cache.

Les résultats de la version actuelle sont consignés dans `preview/compact/README.md`. Ne pas attribuer à cette nouvelle version des scores Lighthouse obtenus avant son changement de texte ; relancer une mesure si nécessaire.

### Instruction prête à transmettre à un autre intervenant

> Lis AGENTS.md, PRODUCT.md et design-plans/plan-reprise-conversation-humaine.md. L’accueil est maintenant intégré localement dans index.html et en/index.html, avec Alpine conservé et Crisp chargé après action explicite. Le concept est une conversation directe avec Alexandre, avec une réponse personnelle en différé. Préserve la branche d’archive ; ne relance pas la refonte globale. Poursuis les ajustements qu’Alexandre demande, sans publication ni message réel de test sans autorisation. Présente tout nouveau texte professionnel pour approbation et vérifie les rendus FR/EN sur ordinateur et mobile. L’idée Model card reste à décider.
