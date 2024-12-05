# NDI 2024

## Lancer le serveur

### Installer les dépendances

```
pnpm install
```

### Préparer l'environnement

Copier `.env.sample` et le renommer `.env`
Générer une APP_KEY avec la commande

```
node ace generate:key
```

### Lancer le serveur de dev

```
pnpm run dev
```

> Vous êtes prêt à coder !

## Mettre en place la base de données

### Démarrer la base de données Postgres

```
sudo docker run -p 5432:5432 -e POSTGRES_PASSWORD=egg -d postgres
```

> Veillez à ce que le `POSTGRES_PASSWORD` de cette commmande et le `DB_PASSWORD` du fichier `.env` correspondent.

### Lancer la migration

```
node ace migration:run
```

> La base de donnée n'attend plus que vous.

## Tester l'API.

Utilisez [Bruno](https://www.usebruno.com/) pour ouvrir la collection [doc](/doc/).
