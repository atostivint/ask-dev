# ask-dev — pré-production

Copie de travail du portfolio [ask.alexandre.tostivint.bzh](https://ask.alexandre.tostivint.bzh) (repo [`atostivint/ask`](https://github.com/atostivint/ask)).

- Les modifications sont poussées **ici d'abord** : https://atostivint.github.io/ask-dev/
- Après validation humaine, le contenu passe sur `main` du repo `ask` → mise en ligne production.
- Pas de pipeline : GitHub Pages déploie chaque push automatiquement (~30 s).

## Développement local de l’accueil

L’accueil compact est intégré dans `index.html` et `en/index.html`. Photo réelle à côté du nom, invitation à une conversation personnelle en différé, disponibilité sans terminal et liens directs vers le CV, LinkedIn et email. Les autres vues restent dans leur structure existante.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8765/` ou `http://127.0.0.1:8765/en/`. L’ancien aperçu sans transmission reste disponible sous `/preview/compact/`.

Le site intégré charge Crisp uniquement après un envoi explicite ou l’ouverture du chat. Accueil et Contact partagent le brouillon et l’état d’envoi. Une suggestion n’envoie rien et ne remplace pas un brouillon existant. Entrée ajoute une ligne. Le brouillon est conservé en cas d’échec ou d’absence de confirmation ; une confirmation ne l’efface que s’il n’a pas été modifié entre-temps.

Les routes `#home`, `#about`, `#testimonials` et `#contact` suivent l’historique du navigateur. Les liens vers parcours, certifications, historique des certifications et projets ouvrent les sections existantes d’À propos. Le changement de langue conserve la route. Les liens directs et le contenu restent disponibles sans JavaScript ; les commandes de messagerie sont alors désactivées.

## Vérifier et reprendre

```powershell
node --test
```

Les tests Node utilisent des simulations locales de Crisp et du navigateur, sans transmettre de message. Ils couvrent notamment les doublons, les brouillons, les confirmations et erreurs, les suggestions, les routes et le réseau statique ou suspendu.

Vérifié localement le 2 octobre 2026 : 18 tests Node passent, 32 rendus FR/EN sans débordement aux largeurs 320/390/768/1440 px et aucune violation Axe sur les quatre vues à 390 px dans les deux langues. L’arrêt manuel et le mouvement réduit ne programment aucune nouvelle frame du réseau.

Voir le [plan de reprise](design-plans/plan-reprise-conversation-humaine.md) pour les décisions, l’état exact et les suites à décider. Les captures et rapports de navigateur sont locaux dans `design-plans/validation/`, ignoré par Git. Aucun envoi réel n’a été utilisé pour vérifier cette intégration.
