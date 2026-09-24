# Distribution

This repository hosts the published releases and GitHub Pages website. Release
tooling and website source live in the musicapp source checkout under
`distribution/`; run the commands below from that checkout.

A request to **build and redistribute** includes building the release assets,
publishing the GitHub release, updating the website's feature claims, publishing
GitHub Pages, and checking the live result. Updating the download assets alone
does not complete the flow.

Run commands below from the repository root on the configured Linux x86_64 host.
The destination is `liamzebedee/distribution`; the website is
https://liamzebedee.github.io/distribution/.

## 1. Build And Validate

```sh
./distribution/build.sh all
```

The script uses Bazel, builds both products for both platforms, and stages four
assets in the ignored `distribution/.out/` directory:

| Directory | Asset |
| --- | --- |
| `linux-amd64` | `MyTunes-linux-amd64.AppImage` |
| `linux-amd64` | `terms-linux-amd64` |
| `macos-arm64` | `MyTunes-macos-x86_64.tar.gz` |
| `macos-arm64` | `terms-macos-arm64` |

Pass `linux-amd64` or `macos-arm64` to build one platform. Despite the staging
directory name, MyTunes is an **Intel x86_64 macOS app**, running on Apple Silicon
through Rosetta. The macOS `terms` binary is native ARM64, cross compiled on Linux.
MyTunes builds inside the configured macOS VM using
`//apps/musicapp/desktop-app:macos_x86_64_release`.

The Mac build performs a startup smoke test. If another MyTunes instance is
already running in the VM, do not kill it. The script stops after building and
copying the archive to `/Users/builder/mytunes-output/`. Retrieve that new archive
using the SSH settings in `apps/musicapp/desktop-app/test/release-testing/macos/run.sh`,
stage it at the path above, and report the skipped startup check. Finish any
remaining targets from `build.sh`, rather than treating its partial run as success.

For downloader changes, also run this in the macOS VM:

```sh
make bazel ARGS='test //apps/musicapp/desktop-app:macos_download_tools_test --test_output=errors'
```

It tests the actual release archive, executable architecture and dependencies,
MP3/H.264 conversion, probing, and yt-dlp discovery of the bundled tools with a
system-only PATH. A live YouTube download is a separate network check. Binary
sources and checksums are documented in
`apps/musicapp/desktop-app/vendor/SOURCES.md`.

## 2. Publish The Release

```sh
./distribution/publish.sh
# Use the exact vN printed by the first invocation:
VERSION=vN PUBLISH_PLATFORM=macos-arm64 ./distribution/publish.sh
```

The first invocation allocates the next `vN`, creates a draft and uploads Linux
assets. The second uploads Mac assets and publishes when all four exist. Set
release notes to describe the shipped change. Preserve platform and architecture
labels. macOS binaries are unsigned or ad hoc signed and not notarized.

If interrupted, inspect the existing draft and its assets before continuing.
Reuse its version; do not allocate another release. Compare all four uploaded
asset sizes and GitHub SHA-256 `digest` values with the staged files. If every
asset is present but the release remains a draft, publish that existing release
and mark it latest after verification. Use its release ID with `gh api` if draft
lookup by tag fails.

Verify `gh api repos/liamzebedee/distribution/releases/latest` returns the intended
published version. Check the website's `/releases/latest/download/` URLs redirect
to that version. Do not change those links to a fixed tag for routine releases.

## 3. Update And Publish The Website

Update existing product copy for the features and limitations that changed:

- `distribution/site/mytunes/index.html` and its source `copy.txt`.
- `distribution/site/termset/index.html` when termset changes.
- Screenshots or install commands only when the release requires them.

Remove obsolete limitations; do not add unrequested page sections or redesigns.
Then publish, even when the download links already resolve to the new release:

```sh
./distribution/publish-site.sh
```

The script clones the distribution repository, copies the site into `docs/`,
commits and pushes changes to `main`, and configures GitHub Pages for `main/docs`.
This publishes the website separately from GitHub release assets.

## 4. Verify And Report

Wait for GitHub Pages to deploy the newly pushed commit. Fetch the live product
page and confirm the revised copy is present and obsolete claims are absent.
Check that the Mac and Linux download links still resolve to the new release.
For layout or interaction changes, also inspect the rendered page and platform
picker. A successful push alone is not proof that the live site has updated.

Report the published release and website links, along with any checks that could
not run. Do not call redistribution complete before both release and website
verification finish.
