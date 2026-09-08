# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruteurs tech, CTO et managers qui arrivent depuis LinkedIn. Ils évaluent un profil cloud architect en quelques secondes et veulent pouvoir poser une question directe, sans formulaire de candidature. Tâche : vérifier la crédibilité du profil, puis entrer en contact sans friction.

## Product Purpose

Page « Posez votre question à Alexandre » : le visiteur écrit depuis la page, le message arrive dans le vrai inbox Crisp d'Alexandre. Succès mesuré : un message envoyé par un recruteur intéressé.

## Positioning

Un portfolio qui n'est pas une vitrine mais une conversation : on parle directement à l'architecte. L'IA qui a construit la page est assumée publiquement, comme preuve de compétence DevOps/agents. Un concurrent peut copier le style, pas la conversation.

## Operating Context

- Site statique sur GitHub Pages (repo public `atostivint/ask`, domaine custom ask.alexandre.tostivint.bzh, HTTPS).
- Chat : Crisp (website id public), iframe synchronisée via `crisp_sid`.
- Fort taux de visiteurs avec adblocker : le script Crisp est souvent bloqué → repli obligatoire ET honnête (jamais de faux « envoyé ✓ »), redirection LinkedIn.
- Flux de travail : pré-prod `atostivint.github.io/ask-dev` validée par l'humain avant push prod.

## Capabilities and Constraints

- Statique pur, aucun backend propre ; tout passe par des services tiers (Crisp).
- Détection de blocage Crisp (~4 s) requise, avec panneau de remplacement.
- Mobile prioritaire : les recruteurs arrivent souvent depuis LinkedIn mobile.
- Images compressées (WebP + fallback JPEG).
- Indécis : intégration Cal.com (lien à créer), version EN éventuelle.

## Brand Commitments

- Nom réel : Alexandre Tostivint uniquement, partout.
- Transparence IA assumée : signature « Généré avec amour par Atlas 🤖 × Alexandre Tostivint ☁️ » conservée, discrète, en pied de page.
- Humour léger autorisé, jamais au prix de l'honnêteté : aucune fausse indication technique à l'écran.
- Photo portrait réelle (alexandre-portrait-a.webp), recadrage resserré validé.

## Evidence on Hand

- Portrait photo validé (assets dans le repo).
- Chiffres vérifiés : « 3× Azure • 6× AWS certified », 300+ clients, FinOps / Well-Architected, ex-DoiT.
- Inbox Crisp réel et opérationnel.

## Product Principles

- Une seule action primaire : envoyer un message depuis la page.
- Moins de texte : chaque mot justifie sa place.
- Honnêteté technique absolue, même quand ça complique.
- La page doit prouver la compétence, pas la revendiquer.

## Accessibility & Inclusion

Contraste suffisant, focus clavier visible, zones tactiles ≥ 44 px sur mobile.
