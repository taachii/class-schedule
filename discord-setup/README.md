# Skrypt Discord-Setup dla WNMZ

Ten folder zawiera skrypt NodeJS w technologii ESM (discord.js), który odpowiada za automatyczne tworzenie oraz utrzymanie struktury serwera Discord dla rocznika z wydziału lekarskiego (kategorie GS, GC, GK, tagi, fora).

## Wymagania
- Node.js >= 18.17
- Poprawnie skonfigurowany plik `.env.local` na poziomie wyżej (skrypt z niego korzysta, lub ze swojego `.env`).

## Konfiguracja
1. Skopiuj `discord-setup/.env.example` do `discord-setup/.env` i uzupełnij.
2. Wejdź na [Discord Developer Portal](https://discord.com/developers/applications) i utwórz aplikację oraz w zakładce **Bot** zdobądź token (zaznacz też uprawnienia Intent: `SERVER MEMBERS INTENT`).
3. Zaproś bota na serwer z uprawnieniami Administrator.
4. Skopiuj ID serwera (z aplikacji Discord) do zmiennej `GUILD_ID`.
5. W pliku `config/starosci.json` zdefiniuj, kto jest starostą jakiej grupy, wklejając tam ID użytkowników Discorda.

## Uruchomienie

1. Zainstaluj zależności:
```bash
cd discord-setup
npm install
```

2. Sprawdź czy plan generuje się poprawnie i czy limity Discorda nie są przekroczone (tzw. `dry-run` - bez łączenia się z Discordem):
```bash
npm run setup -- --year 1 --dry-run
```

3. Utworzenie serwera (zakładając I rok i I semestr):
```bash
npm run setup -- --year 1 --sem 1
```

4. Przejście na semestr letni (dogrywanie tagów na forach):
```bash
npm run start-semester -- --year 1 --sem 2
```

5. Zakończenie roku (archiwizacja):
```bash
npm run archive-year -- --year 1
```
(Po archiwizacji należy uruchomić setup dla II roku: `npm run setup -- --year 2 --sem 1`).

## Aktualizacja uprawnień i nowi starości
Aby zaktualizować starostów, zedytuj `config/starosci.json` podając nowe ID na liście, a następnie uruchom ponownie `npm run setup -- --year X --sem Y`. Skrypt nadpisze nowe uprawnienia i przypisze role. Niczego nie usuwa, zachowuje dotychczasowy stan, dopisując jedynie braki.
