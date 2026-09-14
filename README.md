# Recording Studio plugin SDK

Browser plugin SDK for Featured In and WordPress adapters.

Homepage: [github.com/bowerbird-app/RecordingStudio_plugin_sdk_template](https://github.com/bowerbird-app/RecordingStudio_plugin_sdk_template)

The Rubygems name stays `recording_studio_plugin_sdk_template`.

`docs/gem_template/` stays as architectural reference for the engine conventions. This README is the product guide.

## Install for WordPress adapters

Ship the compiled files from `dist/`. WordPress does not load this SDK from a CDN.

```text
dist/recording-studio-plugin-sdk.js      # IIFE, window.RecordingStudioPluginSdk
dist/recording-studio-plugin-sdk.esm.js  # ESM
dist/recording-studio-plugin-sdk.css     # Flatpack tokens + widget states under .rs-widget
```

Copy those files into the plugin build, for example `build/sdk/`:

```bash
mkdir -p path/to/wp-plugin/build/sdk
cp dist/recording-studio-plugin-sdk.js path/to/wp-plugin/build/sdk/
cp dist/recording-studio-plugin-sdk.css path/to/wp-plugin/build/sdk/
```

Enqueue the local CSS and JS from the plugin. Keep caching and public delivery as WordPress concerns.

During development, build from this repo:

```bash
cd sdk
npm ci
npm test
npm run build
```

`npm run build` also copies artifacts into `test/dummy/public/sdk/` for the Rails proof host.

## Adapter API

```js
const { mount, refresh, destroy, SDK_VERSION } = window.RecordingStudioPluginSdk;

const handle = mount(element, payload);
handle.refresh(nextPayload);
handle.destroy();

refresh(element, nextPayload);
destroy(element);
```

- `mount(element, payload)` validates the payload, creates or reuses a `.rs-widget` root, and returns `{ refresh, destroy }`.
- `refresh(element, payload)` re-validates and re-renders. If the element is not mounted, it mounts.
- `destroy(element)` removes SDK DOM and registry state. A second destroy is a no-op.

## Payload contract (`schema_version` 1)

```json
{
  "schema_version": 1,
  "html": "<p>Hello</p>",
  "configuration": {},
  "sdk": {
    "minimum_version": "0.3.0"
  }
}
```

| Field | Meaning |
|---|---|
| `schema_version` | Must be the integer `1` |
| `html` | HTML fragment rendered inside `.rs-widget` |
| `configuration` | Opaque plain object for future widget settings |
| `sdk.minimum_version` | Semver floor the running SDK must meet |

Unknown schema versions fail closed into the error state.

## Lifecycle

Per mounted element the SDK is in one state:

`loading` → `ready` | `empty` | `error` | `incompatible_version`

- Empty HTML (after sanitize) → `empty`
- Invalid payload → `error`
- `sdk.minimum_version` above `SDK_VERSION` → `incompatible_version`
- Otherwise → `ready`

The active state is exposed as `data-rs-state` on the `.rs-widget` root.

## CSS isolation

All SDK styles are under `.rs-widget`. There is no Shadow DOM.

Flatpack design tokens are synced at build time from Flatpack `variables.css` `:root` into `.rs-widget { ... }`. Hosts do not need Tailwind or Rails to consume the CSS bundle.

## Security

- Payload HTML is parsed and sanitized before insert.
- `<script>` tags and `on*` attributes are stripped.
- `javascript:` URLs on `href` / `src` are stripped.
- The SDK never evaluates API scripts or payload scripts.

## Version alignment

Gem `RecordingStudioPluginSdkTemplate::VERSION`, `sdk/package.json`, and `sdk/src/version.ts` share one version. CI checks that, rebuilds `dist/`, and fails if committed artifacts drift.

## Dummy host

The dummy app in `test/dummy/` is a Rails 8.1 proof host. It mounts Recording Studio, signs in with Devise, and renders FlatPack. It does not mount this gem's engine. It has no Featured In models and no WordPress adapter.

Open `/` after sign-in to mount fixture payloads from `/sdk-fixtures/` with assets from `/sdk/`.

Authenticated dummy pages use Recording Studio's shared default layout (`RecordingStudio::UsesDefaultLayout`) plus FlatPack CSS and JS. Devise keeps its own sign-in layout. Dummy `/docs/*` pages stay in the dummy app as a host-app sandbox.

### Login credentials

| Field    | Value           |
|----------|-----------------|
| Email    | admin@admin.com |
| Password | Password        |

### Useful dummy routes

- `/` proof host for the SDK fixtures
- `/users/sign_in` Devise sign-in
- `/sdk/*` committed SDK assets
- `/sdk-fixtures/*` schema_version 1 fixtures
- `/docs/*` dummy-only starter pages

## Tech stack

| Component       | Version |
|-----------------|---------|
| Ruby            | 3.3+    |
| Rails           | 8.1+    |
| Node            | 20+ (CI uses 22) |
| PostgreSQL      | 16      |
| TailwindCSS     | 4 (dummy host only) |
| RecordingStudio | 4.x (`~> 4.2`) |
| FlatPack        | tokens synced into SDK CSS |
| Devise          | latest  |

## Out of scope

This phase does not include WordPress OAuth or proxy, `RS_Embeddable`, real Featured In widgets, Shadow DOM, or npm or CDN publish.
