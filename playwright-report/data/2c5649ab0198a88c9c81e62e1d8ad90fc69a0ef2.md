# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - heading "Sim Racing Practice Analyzer" [level=1] [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8] [cursor=pointer]:
          - generic [ref=e9]: "Dernière session :"
          - generic "Aucune donnée disponible" [ref=e10]: "-"
        - button "Mode clair" [ref=e11]: ☀️
        - button "Connexion admin" [ref=e12]: 🔐 Admin
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: "📅 Période :"
          - combobox "📅 Période :" [ref=e19] [cursor=pointer]:
            - option "À tout moment" [selected]
            - option "Dernière semaine"
            - option "Dernière journée"
        - generic [ref=e20]:
          - generic [ref=e21]: "🏁 Piste :"
          - combobox "🏁 Piste :" [ref=e22] [cursor=pointer]:
            - option "Toutes les pistes" [selected]
        - generic [ref=e24] [cursor=pointer]:
          - checkbox "📊 Grouper par classe" [ref=e25]
          - generic [ref=e26]: 📊 Grouper par classe
      - paragraph [ref=e28]: Aucun pilote trouvé avec les filtres sélectionnés.
      - paragraph [ref=e30]: 0 pilote(s) affiché(s)
```