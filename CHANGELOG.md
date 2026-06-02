# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-03

### Added
- Added a visual git-like diff viewer to inspect data modifications side-by-side inside the Payload Admin UI.
- Formatted the diff layout to mirror GitHub's editor showing line-by-line changes with `+` and `-` status markers.
- Enhanced dark mode styling support for `[data-theme="dark"]` and `.dark` with higher-contrast, accessibility-friendly colors.

### Changed
- Refined diff classification logic to identify cleared/emptied fields (e.g., changing to `""` or `null`) as `removed` and new fields as `added` instead of always reporting `modified`.

## [1.0.1] - 2026-04-25

### Changed
- Renamed the plugin to `payload-audit-logs`.
- Renamed the `collection` field to `entity` in the `AuditLogs` collection to avoid potential conflicts with MongoDB reserved keywords.
- Updated audit log hooks and integration tests to use the new `entity` field.
- Cleaned up `package.json` by removing the circular self-dependency.
