# Product

<!-- impeccable:product-schema 1 -->

## Platform

Web statique : HTML, CSS et JavaScript, avec Alpine local pour les vues et le formulaire. Aucun framework ou build supplémentaire.

## Users

Deux publics de même importance : recruteurs et responsables techniques qui évaluent un profil senior cloud, solutions ou platform architecture ; clients qui souhaitent discuter d'une mission ciblée. Les visiteurs arrivent notamment depuis LinkedIn, souvent sur mobile.

## Product Purpose

Permettre de comprendre le profil d'Alexandre Tostivint, consulter des exemples concrets de son travail, puis initier une conversation pour un poste ou une mission. Le succès se juge sur les demandes pertinentes effectivement reçues, sans ajouter de tracking.

## Positioning

Portfolio technique sobre, centré sur les réalisations, avec une conversation directe avec Alexandre. L'aide de l'IA à la création du site est mentionnée discrètement avec une formulation approuvée ; les comportements déterministes du site ne sont pas présentés comme de l'IA.

## Navigation and Contact

- Vues distinctes Accueil, Projets, Parcours et Contact, disponibles en français et en anglais.
- Fragments publics `#home`, `#projects`, `#about`, `#contact`, `#contact/hiring` et `#contact/consulting` ; navigation compatible avec historique, liens directs et changement de langue.
- Contexte des projets accessible via `#about/doit` et `#about/cloudreach`. Les liens historiques vers certifications et parcours restent utilisables.
- Accueil : identité compacte, avatar fourni et photo « coucou », disponibilité façon terminal, conversation dominante, suggestions et liens secondaires recrutement, conseil et CV.
- Projets : trois réalisations en lignes éditoriales, technologies et liens vers les expériences, puis trois domaines de conseil.
- Parcours (`#about`) : courte biographie, chiffres lisibles, certifications actuelles, timeline avec lien « Vous ? » vers le recrutement, missions repliables, expériences antérieures, formation, talks et historique des certifications.
- Contact : demande de recrutement ou de conseil, brouillon modifiable et bouton d'envoi explicite. Les suggestions ne transmettent jamais de message.
- Accueil et Contact partagent le brouillon et l'état d'envoi. Entrée ajoute une ligne. Les commandes exactes `whoami` et `kubectl get certifs` lisent les informations du parcours, avec action « Exécuter en local », sans charger Crisp ni transmettre de message.
- Email, LinkedIn et lien Google Calendar existant restent accessibles. XMPP est secondaire.

## Operating Context

- Préproduction : dépôt `atostivint/ask-dev`, GitHub Pages. Production : dépôt `atostivint/ask`, domaine `ask.alexandre.tostivint.bzh`.
- Crisp est chargé uniquement après une action explicite d'ouverture du chat ou d'envoi. Locale FR/EN explicite, launcher et tooltip masqués hors conversation.
- Délai de disponibilité : environ 4 secondes. Une arrivée tardive du SDK ne transmet pas le brouillon abandonné.
- Envoi : le texte est conservé jusqu'à l'événement Crisp `message:sent` correspondant. Un événement envoyé confirme le signal du SDK, pas la lecture du message par Alexandre.
- Sans confirmation après 10 secondes : statut incertain, brouillon conservé, pas de renvoi automatique. Vérification dans le chat ou contact direct.
- Aucun message de test réel sans autorisation spécifique. Validation du flux d'envoi avec SDK simulé.
- Les changements de production et les pushes requièrent l'approbation explicite d'Alexandre.

## Brand and Content

- Identité publique : Alexandre Tostivint uniquement.
- Direction validée par le plan d'accueil portail : fond sombre, accent bleu et typographie système. Monospace réservé au terminal, commandes et métadonnées techniques. Avatar IA fourni (`avatar-ai.png`) clairement identifié et photo fournie (`alexandre-coucou-aligne.jpg`) au survol, focus ou toucher. Aucun nouvel asset généré.
- Réseau sur l'accueil uniquement, arrêté dans les autres vues et les onglets cachés. Contrôle visible d'arrêt des animations. Mouvement réduit : réseau statique sans programmation de frame et portrait sans transition. Aucun faux témoignage ni compteur animé.
- Aucun em dash dans les textes visibles. Toute nouvelle copie professionnelle est approuvée avant insertion.
- Copie bilingue et disponibilité approuvées par Alexandre le 2 octobre 2026 ; dossier de revue : `design-plans/copy-review.md`.
- Six certifications actives confirmées par Alexandre le 2 octobre 2026 : quatre AWS et deux Microsoft. Les liens individuels et dates restent consultables. Réexaminer le total après renouvellement ou expiration.
- Distinction explicite : plateforme DoiT avec 2 000+ comptes clients, dont 70+ onboardings personnels ; ne pas attribuer le total de la plateforme à Alexandre seul.

## Accessibility and Validation

- Focus clavier visible, champs étiquetés, contrôles natifs, zones tactiles d'au moins 44 px sur mobile, respect de `prefers-reduced-motion`.
- Vérifier les vues FR/EN à 320, 390, 768 et 1440 px, historique, deep links et ouverture des détails.
- Sans JavaScript : contenu lisible et navigation par ancres ; liens de contact directs disponibles.
- Tests du comportement et du réseau : `node --test tests/*.test.js`. Aucun gestionnaire de dépendances ou build requis.
