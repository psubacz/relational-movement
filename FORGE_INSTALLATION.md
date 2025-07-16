# ForgeVTT Installation Guide

## Setup for ForgeVTT Distribution

### Step 1: Create GitHub Repository

1. **Create a new GitHub repository** named `relational-movement`
2. **Upload your module files** to the repository
3. **Update module.json** with your GitHub username:

```json
{
  "manifest": "https://github.com/YOUR_USERNAME/relational-movement/releases/latest/download/module.json",
  "download": "https://github.com/YOUR_USERNAME/relational-movement/releases/latest/download/relational-movement-v0.1.0.zip"
}
```

### Step 2: Create a Release

1. **Push all files** to your GitHub repository
2. **Create a tag and release**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
3. The GitHub workflow will automatically create the release with proper assets

### Step 3: Install in ForgeVTT

1. **Open your ForgeVTT world**
2. **Go to "Manage Modules"**
3. **Click "Install Module"**
4. **Paste the manifest URL**:
   ```
   https://github.com/YOUR_USERNAME/relational-movement/releases/latest/download/module.json
   ```
5. **Click "Install"**

## Alternative: Direct Installation

If you don't want to use GitHub, you can:

1. **Package the module**:
   ```bash
   ./package.sh
   ```

2. **Upload to ForgeVTT Assets**:
   - Upload `relational-movement-v0.1.0.zip` to your ForgeVTT assets
   - Update module.json with your asset URLs

3. **Update module.json**:
   ```json
   {
     "manifest": "https://YOUR_FORGE_URL/module.json",
     "download": "https://YOUR_FORGE_URL/relational-movement-v0.1.0.zip"
   }
   ```

## Testing Installation

1. **Verify module loads** without errors in browser console
2. **Test toggle functionality** with Ctrl+M
3. **Test distance rings** by selecting tokens
4. **Check module settings** in Game Settings → Module Settings

## Manifest URL Format

Your final manifest URL should look like:
```
https://github.com/[USERNAME]/relational-movement/releases/latest/download/module.json
```

This URL is what ForgeVTT users will use to install your module directly from the module installation interface.