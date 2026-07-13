# DeTour — Full Stack (Frontend + Backend)

This package contains both halves of DeTour:

- `detour-front/` — Expo (React Native + TypeScript) app, SDK 54
- `detour-backend/` — Spring Boot 4 API (`api/` subfolder), connects to a Neon (cloud) PostgreSQL database

They were already wired to match each other (same field names, same endpoints). Two real bugs were fixed in the backend before this was packaged:

1. **`ApiApplication.main()` was missing `public`** — the JVM can't find `static void main`, only `public static void main`. Without this fix, the backend would fail to start at all with a "Main method not found" error.
2. **No CORS configuration existed** (it was commented out on `AttractionController` and missing everywhere else). Added a global `CorsConfig` that allows requests from any origin on `/api/**`, so your Expo app (on your phone, a different device on the network) can actually reach it.

## 1. Backend setup

The backend reads three environment variables for its Neon database connection (see `api/src/main/resources/application.properties`):

```
NEON_DB_URL
NEON_DB_USERNAME
NEON_DB_PASSWORD
```

You need to set these to your own Neon project's connection details before running. How you set them depends on how you run the app:

- **IntelliJ**: Run → Edit Configurations → Environment variables → add the three keys.
- **Terminal (Windows PowerShell)**:
  ```powershell
  $env:NEON_DB_URL="jdbc:postgresql://<your-neon-host>/<dbname>?sslmode=require"
  $env:NEON_DB_USERNAME="<your-username>"
  $env:NEON_DB_PASSWORD="<your-password>"
  cd detour-backend/api
  ./mvnw.cmd spring-boot:run
  ```

`ddl-auto=validate` means the backend expects the tables (`users`, `attractions`, `bookings`) to already exist in Neon with matching columns — it won't create them for you. If you haven't created those tables yet, you'll need to run the schema/seed SQL against Neon first.

Once running, confirm it started by visiting `http://localhost:8080/api/attractions` in a browser on the same machine — you should get `[]` or a list of attractions back (not an error page).

## 2. Find your PC's LAN IP

Your phone needs to reach your PC over the network — `localhost` only means "this device," which is meaningless on a phone.

```powershell
ipconfig
```

Look for the `IPv4 Address` under your active Wi-Fi adapter (something like `192.168.1.42`).

## 3. Point the frontend at the backend

Edit `detour-front/src/api/client.ts`:

```ts
export const BASE_URL = "http://192.168.1.42:8080"; // <- your actual LAN IP
```

## 4. Run the frontend

```powershell
cd detour-front
npm install --legacy-peer-deps
npx expo start --tunnel
```

Scan the QR with Expo Go. (`--tunnel` works even if your PC and phone aren't cleanly visible to each other on the network — e.g. campus Wi-Fi with client isolation. Once you confirm things work, `npx expo start` without `--tunnel` will be faster if your network allows direct LAN access.)

## Checklist if something doesn't connect

- [ ] Backend printed `Started ApiApplication` in the console with no errors
- [ ] `http://localhost:8080/api/attractions` works in a browser on your PC
- [ ] Phone and PC are on the same Wi-Fi (or you're using `--tunnel`)
- [ ] `BASE_URL` in `client.ts` uses your PC's actual LAN IP, not `localhost`
- [ ] Windows Firewall isn't blocking Java/port 8080 (same issue as Node earlier — allow it through both Private and Public profiles)
