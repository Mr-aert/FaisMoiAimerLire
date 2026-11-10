# Comptes enchantés

Mini-site de lecture à choix multiples, sans outil de compilation ni dépendance.
Les pages sont servies directement par GitHub Pages.

## Prévisualiser le site

Comme les textes et l’histoire sont chargés avec `fetch`, ouvre le site avec un
petit serveur HTTP plutôt qu’en ouvrant `index.html` directement. Par exemple,
à la racine du dépôt :

```sh
python3 -m http.server 8000
```

Puis visite <http://localhost:8000>.

## Publier sur GitHub Pages

Dans les paramètres du dépôt, ouvre **Pages**, choisis **Deploy from a branch**,
puis sélectionne la branche voulue et le dossier **/(root)**. Le site sera
disponible à l’adresse GitHub Pages du dépôt.

## Ajouter ou modifier une page

Les pages et leurs boutons sont définis dans [`1_DND/histoire.json`](1_DND/histoire.json).
Chaque entrée indique son titre, son image, son fichier texte Markdown et ses
choix. Pour créer une page :

1. Ajoute son image dans `1_DND/Images/` et son texte dans `1_DND/Textes/`.
2. Ajoute une entrée dans `histoire.json` avec un identifiant unique.
3. Ajoute entre deux et trois choix, chacun avec son libellé et l’identifiant
   de la page de destination.
4. Depuis une autre page, pointe un choix vers cet identifiant.

L’accueil utilise `Acceuil_global.png`. Son bouton « Paladin Orion et le cristal
volé » ouvre la page `0_Acceuil`. Le texte de chaque page est chargé depuis son
fichier `.md`; un fichier vide laisse la zone de lecture vide. Les titres,
paragraphes, listes, mots en **gras**, en *italique* et le `code` sont affichés
avec une mise en forme simple.
