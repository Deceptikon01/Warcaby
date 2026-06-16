# Wesołe Warcaby

Mini-gra w React oparta o warcaby z animacjami, poziomami trudności i zwierzakami zamiast klasycznych pionków.

## Jak uruchomić lokalnie

1. Zainstaluj zależności:

```bash
npm install
```

2. Odpal projekt:

```bash
npm run dev
```

3. Zbuduj wersję produkcyjną:

```bash
npm run build
```

## GitHub Pages

Projekt jest przygotowany do publikacji na GitHub Pages:

1. W repo na GitHubie wejdź w `Settings > Pages`.
2. Ustaw źródło publikacji na `GitHub Actions`.
3. Wypchnij kod na gałąź `main` albo `master`.
4. Workflow zbuduje `dist` i opublikuje stronę automatycznie.

## Jak wrzucić na GitHuba

1. Utwórz nowe repo na GitHubie.
2. Podepnij remote:

```bash
git remote add origin <URL_REPO>
```

3. Wypchnij zmiany:

```bash
git add .
git commit -m "Add Wesołe Warcaby"
git push -u origin master
```

Jeśli chcesz, mogę też przygotować wersję bez Tailwind CDN albo dopisać własny adres strony do workflow.
