# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruteurs tech, CTO et managers qui arrivent depuis LinkedIn. Ils évaluent un profil cloud architect en quelques secondes et veulent pouvoir poser une question directe, sans formulaire de candidature. Tâche : vérifier la crédibilité du profil, puis entrer en contact sans friction.

## Product Purpose

Page « Posez votre question à Alexandre » : le visiteur écrit depuis la page, le message arrive dans le vrai inbox Crisp d'Alexandre. Succès mesuré : un message envoyé par un recruteur intéressé.

## Positioning

Un portfolio qui invite à découvrir l’architecte en lui posant directement une question. Alexandre répond personnellement en différé. Le visiteur doit comprendre qui reçoit le message, et garder un accès direct au CV et au parcours sans écrire.

## Operating Context

- Site statique sur GitHub Pages (repo public `atostivint/ask`, domaine custom ask.alexandre.tostivint.bzh, HTTPS).
- Chat : Crisp (identifiant public existant), chargé uniquement après un envoi ou une ouverture explicite du chat.
- Fort taux de visiteurs avec adblocker : le script Crisp est souvent bloqué → repli obligatoire ET honnête (jamais de faux « envoyé ✓ »), redirection LinkedIn.
- Flux de travail : pré-prod `atostivint.github.io/ask-dev` validée par l'humain avant push prod.

## Capabilities and Constraints

- Statique pur, aucun backend propre ; tout passe par des services tiers (Crisp).
- Détection de blocage Crisp (~4 s) requise, avec panneau de remplacement.
- Mobile prioritaire : les recruteurs arrivent souvent depuis LinkedIn mobile.
- Images compressées (WebP + fallback JPEG).
- Parité française et anglaise, avec changement de langue vers la vue correspondante.

## Brand Commitments

- Nom réel : Alexandre Tostivint uniquement, partout.
- Pas de nom interne d’assistant ni de pseudonyme dans la présentation professionnelle.
- Humour léger autorisé, jamais au prix de l'honnêteté : aucune fausse indication technique à l'écran.
- Photo portrait réelle (alexandre-portrait-a.webp), recadrage resserré validé.

## Evidence on Hand

- Portrait photo validé (assets dans le repo).
- Chiffres vérifiés : « 3× Azure • 6× AWS certified », 300+ clients, FinOps / Well-Architected, ex-DoiT.
- Inbox Crisp existant ; aucun envoi réel de vérification dans cette étape locale.

## Product Principles

- Une seule action primaire : envoyer un message depuis la page.
- Moins de texte : chaque mot justifie sa place.
- Honnêteté technique absolue, même quand ça complique.
- La page doit prouver la compétence, pas la revendiquer.
- Les suggestions remplissent uniquement un brouillon vide, sans envoi. Entrée ajoute une ligne.
- Accueil et Contact partagent le brouillon et l’état d’envoi. Le brouillon est conservé tant qu’un envoi correspondant n’a pas été confirmé par le SDK, sans effacer de nouvelles modifications.

## Accessibility & Inclusion

Contraste suffisant, focus clavier visible, zones tactiles ≥ 44 px sur mobile.

## État du développement local

Au 2 octobre 2026, accueil compact intégré localement en FR/EN : portrait réel à côté du nom, disponibilité sans terminal, explication de la conversation personnelle en différé. Réseau limité à l’accueil, arrêt manuel, suspension lorsque l’onglet est caché et rendu statique avec mouvement réduit. Architecture statique et Alpine local conservés.

Les vues À propos, Témoignages et Contact restent dans leur structure existante ; Contact reçoit un champ partageant le brouillon de l’accueil. Les chiffres historiques du parcours et le contenu de démonstration des témoignages ne sont pas de nouvelles preuves validées par cette intégration. La piste « Model card » reste à décider.

Aucun message réel, commit, push ou déploiement dans cette étape. La connexion Crisp réelle n’a pas été vérifiée par un envoi : les vérifications utilisent des simulations et un blocage réseau. Voir `design-plans/plan-reprise-conversation-humaine.md` pour reprendre le travail.
