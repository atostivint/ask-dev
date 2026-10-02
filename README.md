# ask-dev — pré-production

Copie de travail du portfolio [ask.alexandre.tostivint.bzh](https://ask.alexandre.tostivint.bzh) (repo [`atostivint/ask`](https://github.com/atostivint/ask)).

- Les modifications sont poussées **ici d'abord** : https://atostivint.github.io/ask-dev/
- Après validation humaine, le contenu passe sur `main` du repo `ask` → mise en ligne production.
- Pas de pipeline : GitHub Pages déploie chaque push automatiquement (~30 s).

## Aperçu local

Depuis la racine du dépôt :

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8765/` ou `http://127.0.0.1:8765/en/`.
Le site utilise HTML, CSS, JavaScript et la copie locale d'Alpine. Aucun build ou installation de dépendances n'est nécessaire.

## Vérification

```powershell
node --test tests/*.test.js
```

Les tests simulent le SDK Crisp : aucun message réel n'est transmis. Ils couvrent l'envoi explicite, le brouillon partagé Accueil/Contact, les commandes locales, les suggestions, les doublons, les erreurs, les délais, la navigation FR/EN et l'arrêt du réseau animé.
Compléter par une revue des quatre vues dans le navigateur à 320, 390, 768 et 1440 px, avec clavier, liens directs et navigation précédente/suivante. Les captures et rapports locaux sont placés dans `design-plans/validation/`, ignoré par Git.

La copie professionnelle est approuvée avant insertion. Les pushes et la publication en production nécessitent l'accord explicite d'Alexandre.
