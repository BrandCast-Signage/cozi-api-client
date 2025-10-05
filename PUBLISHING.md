# Publishing Guide

This guide explains how to publish the Cozi API Client to npm.

## Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/signup
2. **npm authentication**: Run `npm login` to authenticate
3. **Organization access**: Ensure you have publish rights to @brandcast scope
   - Alternatively, change package name to publish under your own scope

## Pre-Publishing Checklist

- [x] All tests pass (`npm test`)
- [x] Build succeeds (`npm run build`)
- [x] Package version updated in `package.json`
- [x] CHANGELOG.md updated
- [x] README.md complete
- [x] LICENSE file present
- [x] .npmignore configured correctly
- [x] Git tag created for release

## Publishing Steps

### 1. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This should show:
- dist/ (compiled JavaScript and type definitions)
- README.md
- LICENSE
- package.json

### 2. Test Package Locally (Optional)

Create a test package and install it locally:

```bash
npm pack
npm install -g ./brandcast-cozi-api-client-0.1.0.tgz
```

### 3. Publish to npm

#### Option A: Publish to @brandcast scope (requires org access)

```bash
npm publish --access public
```

#### Option B: Publish under your own scope

1. Change package name in `package.json`:
```json
{
  "name": "@YOUR_USERNAME/cozi-api-client",
  ...
}
```

2. Publish:
```bash
npm publish --access public
```

### 4. Verify Publication

After publishing, verify at:
- npm: https://www.npmjs.com/package/@brandcast/cozi-api-client
- unpkg: https://unpkg.com/@brandcast/cozi-api-client/

### 5. Create GitHub Release

1. Go to: https://github.com/BrandCast-Signage/cozi-api-client/releases/new
2. Select tag: v0.1.0
3. Release title: "v0.1.0 - Initial Release"
4. Description: Copy from CHANGELOG.md
5. Publish release

## Post-Publishing

### Update Documentation

- [ ] Add npm badge to README
- [ ] Update installation instructions if package name changed
- [ ] Announce release (if appropriate)

### Monitor

- Check npm downloads: https://npm-stat.com/charts.html?package=@brandcast/cozi-api-client
- Monitor issues and questions
- Watch for security advisories

## Publishing Updates

For subsequent releases:

1. Update version in `package.json`:
   - Patch: `0.1.1` (bug fixes)
   - Minor: `0.2.0` (new features, backwards compatible)
   - Major: `1.0.0` (breaking changes)

2. Update CHANGELOG.md with changes

3. Commit changes:
```bash
git add .
git commit -m "chore: bump version to x.x.x"
```

4. Create and push tag:
```bash
git tag -a vx.x.x -m "Release vx.x.x"
git push origin main --tags
```

5. Publish:
```bash
npm publish
```

6. Create GitHub release

## Troubleshooting

### Publishing Fails - Not Authenticated
```bash
npm login
```

### Publishing Fails - No Access to @brandcast Scope
Either:
1. Request access to @brandcast organization
2. Or publish under your own scope (see Option B above)

### Publishing Fails - Version Already Exists
Update version in package.json and try again

### Package Size Too Large
- Check .npmignore is excluding unnecessary files
- Run `npm pack --dry-run` to see what's included

## Important Notes

- **Scoped packages** (@brandcast/...) require `--access public` to be publicly available
- **Always test** before publishing (run `npm test`)
- **Never publish** with uncommitted changes
- **Semantic versioning** is important for users to understand changes
- This is an **UNOFFICIAL** library - ensure disclaimer is clear in all documentation
