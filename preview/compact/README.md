# Aperçu de l’accueil compact

Aperçu isolé du portfolio : petite photo réelle fournie à côté du nom et du rôle, disponibilité en texte simple, conversation compacte en dessous. Le titre « Le plus simple pour me connaître ? Me poser une question. » et son explication, proposés puis acceptés par Alexandre, présentent une conversation personnelle en différé. Les liens CV, LinkedIn et email sont ceux du site.

Le [plan de reprise autonome](../../design-plans/plan-reprise-conversation-humaine.md) contient l’intention, les décisions, les textes FR/EN, les fichiers, le démarrage local, la piste « Model card » et les étapes d’intégration à décider.

Ouvrir `/preview/compact/` ou `/preview/compact/en/` depuis le serveur local. HTML, CSS et JavaScript natifs, sans dépendance ni build supplémentaire. La feuille de style et les images existantes sont réutilisées.

Les suggestions remplissent seulement un brouillon vide. Entrée ajoute une ligne. Le bouton d’envoi affiche explicitement qu’il s’agit d’un aperçu et conserve le brouillon. Aucun SDK de messagerie n’est chargé et aucun message n’est transmis.

`network.js` reprend le réseau corrigé de la branche d’archive. Le mouvement réduit produit un rendu statique sans boucle ; les animations peuvent être arrêtées et sont suspendues quand l’onglet est caché.

L’accueil existant reste inchangé. Cet aperçu sert à décider de la composition avant toute intégration.

## Vérification locale du 2 octobre 2026

- Rendus réels FR/EN à 320, 390, 768 et 1440 px : photo à côté du nom, aucun débordement, cibles tactiles d’au moins 44 px. Champ et bouton visibles dans le premier écran mobile de 844 px.
- Clavier et toucher : suggestions, conservation d’un brouillon existant, Entrée pour ajouter une ligne, action d’aperçu sans transmission et focus visible.
- Aucun appel à un service externe pendant les interactions testées. Sans JavaScript, les contrôles interactifs sont désactivés ; la photo, les textes et les liens directs restent disponibles.
- Arrêt des animations : aucune nouvelle frame programmée après l’arrêt. Mouvement réduit : zéro frame programmée.
- Après l’ajout du texte expliquant le concept, les huit rendus et les interactions ont été revérifiés ; Axe ne signale aucune violation sur les aperçus FR/EN. À 320 et 390 px, le bouton d’envoi reste dans le premier écran de 844 px (bas du bouton entre 665 et 734 px).
- La mesure Lighthouse locale antérieure au nouveau texte donnait accessibilité 100, performance 100, LCP 1,7 s et CLS 0. Elle n’a pas été relancée pour cette version ; ne pas la présenter comme un score de la version actuelle.
- Captures et rapports : `design-plans/validation/compact-*` et `lighthouse-compact.json`, ignorés par Git.

Aucun commit, push ou déploiement effectué pour cet aperçu.
