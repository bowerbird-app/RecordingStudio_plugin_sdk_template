# Recording Studio plugin SDK

Browser plugin SDK for Featured In and WordPress adapters.

Homepage: [github.com/bowerbird-app/RecordingStudio_plugin_sdk_template](https://github.com/bowerbird-app/RecordingStudio_plugin_sdk_template)

The Rubygems name stays `recording_studio_plugin_sdk_template`.

`docs/gem_template/` stays as architectural reference for the engine conventions. This README is the product guide.

## Dummy host

The dummy app in `test/dummy/` is a Rails 8.1 proof host. It mounts Recording Studio, signs in with Devise, and renders FlatPack. It does not mount this gem's engine. It has no Featured In models and no WordPress adapter.

Authenticated dummy pages use Recording Studio's shared default layout (`RecordingStudio::UsesDefaultLayout`) plus FlatPack CSS and JS. Devise keeps its own sign-in layout. Dummy `/docs/*` pages stay in the dummy app as a host-app sandbox.

### Cursor Cloud Agent

A Cloud Agent boots this repo into a ready-to-use dev environment. The setup lives in `.cursor/`:

- `install.sh` provisions Ruby (pinned by `.ruby-version`), PostgreSQL 16, all gems, the seeded dummy database, and compiled CSS at build time, then fetches Recording Studio skills.
- `start.sh` starts PostgreSQL on every boot.
- `environment.json` runs the `rails-server` and `tailwind-watch` terminals and exposes port 3000.

Open port 3000 and sign in at `/users/sign_in`. No environment variables are required. The dummy app's `database.yml` defaults match the provisioned PostgreSQL cluster.

### GitHub Codespaces

1. Click **Code** → **Codespaces** → **Create codespace**
2. Wait for setup to complete
3. Run:

```bash
cd test/dummy
bin/rails db:setup
bin/dev
```

4. Open port 3000. Sign in at `/users/sign_in`.

### Login credentials

| Field    | Value             |
|----------|-------------------|
| Email    | admin@admin.com   |
| Password | Password          |

The login form is prefilled with these credentials.

### Useful dummy routes

- `/` is the dummy app home page
- `/users/sign_in` is the Devise sign-in page
- `/recording_studio` redirects to `/` while the mounted Recording Studio engine remains data and API focused
- `/docs/install`, `/docs/config`, `/docs/recordable_types`, `/docs/recordings_tree`, `/docs/gem_views`, `/docs/methods` are dummy-only starter pages

## Dummy Recording Studio host

The dummy host follows Recording Studio's root recording pattern:

- Workspace is the top-level recordable
- Folder and Page demonstrate nested recordables under the workspace root
- Each configured recordable declares `recording_studio_recordable(...)`. Strict declaration validation stays enabled
- A root `RecordingStudio::Recording` wraps the Workspace
- `Current.actor` is set from `current_user` (Devise) in `ApplicationController`

Capability mixins are opt-in. Installing this gem does not enable mixins on host types. The dummy Workspace enables Accessible. Folder and Page do not.

```ruby
RecordingStudio.enable_capability(:accessible, on: Workspace)
```

Use core `RecordingStudio::Hooks` and `RecordingStudio::Services::BaseService`.

Dummy chrome uses FlatPack ViewComponents. Use the live FlatPack demo at [flatpack.bowerbird.io](https://flatpack.bowerbird.io/) before you add custom host UI. The browser SDK does not ship Ruby ViewComponents.

## Tech stack

| Component       | Version |
|-----------------|---------|
| Ruby            | 3.3+    |
| Rails           | 8.1+    |
| PostgreSQL      | 16      |
| TailwindCSS     | 4       |
| RecordingStudio | 4.x (`~> 4.2` in the gemspec; dummy GitHub tag `v4.2.0`) |
| Accessible      | dummy GitHub tag `v0.9.1` |
| Root Switchable | dummy GitHub tag `v0.5.0` |
| FlatPack        | dummy GitHub tag `v0.1.177` |
| Devise          | latest  |

The dummy Gemfile keeps `github:` sources so Bundler can fetch those gems. The gemspec still pins `recording_studio` to `~> 4.2` so the addon declares the core dependency even when GitHub is the fetch source.

## Out of scope

This phase does not include WordPress OAuth or proxy, `RS_Embeddable`, real Featured In widgets, Shadow DOM, or npm or CDN publish.
