# Cloudflare Pages Deployment Guide

## Overview
This project is configured for deployment on Cloudflare Pages with optimized build settings and proper SPA routing support.

## Configuration Files

### 1. `wrangler.toml`
- Configures the project name and build settings
- Sets compatibility date for Cloudflare Workers runtime
- Defines build command and output directory
- Includes custom headers and SPA redirect rules

### 2. `public/_redirects`
- Handles client-side routing for the Single Page Application
- Redirects all routes to `index.html` with 200 status

### 3. `public/_headers`
- Sets security headers (X-Frame-Options, CSP, etc.)
- Configures caching policies for static assets
- Optimizes performance with proper cache control

## Deployment Methods

### Method 1: Automatic GitHub Integration (Recommended)
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build:pages`
3. Set build output directory: `dist`
4. Set environment variables if needed
5. Deploy automatically on every push to main branch

### Method 2: Manual Deployment via CLI
```bash
# Build the project
npm run build:pages

# Deploy to Cloudflare Pages
npm run deploy

# Or deploy a preview
npm run deploy:preview
```

### Method 3: Direct Wrangler Commands
```bash
# Install Wrangler globally (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create a new Pages project
wrangler pages project create fertility-benefits-toolkit

# Deploy the built assets
wrangler pages deploy dist --project-name fertility-benefits-toolkit
```

## Build Scripts

- `npm run build:pages` - Clean build for Cloudflare Pages (no dependency installation)
- `npm run build` - Full build with dependency installation (for CI/CD)
- `npm run deploy` - Deploy to production
- `npm run deploy:preview` - Deploy preview with compatibility date

## Environment Variables

If your application uses environment variables, set them in:
1. Cloudflare Pages dashboard → Settings → Environment variables
2. Or via Wrangler CLI:
   ```bash
   wrangler pages secret put VARIABLE_NAME
   ```

## Performance Optimizations

- **Code Splitting**: Vite automatically splits code into optimized chunks
- **Asset Caching**: Static assets cached for 1 year with immutable headers
- **HTML Caching**: Index.html has no-cache policy for fresh content
- **Compression**: Gzip compression enabled by default on Cloudflare
- **CDN**: Global CDN distribution for fast loading worldwide

## Security Features

- **XSS Protection**: X-XSS-Protection header enabled
- **Content Type Sniffing**: Disabled via X-Content-Type-Options
- **Frame Options**: Prevents embedding in iframes
- **Referrer Policy**: Strict referrer policy for privacy
- **Permissions Policy**: Restricts access to sensitive APIs

## Troubleshooting

### Common Issues:

1. **404 on page refresh**: Ensure `_redirects` file is in `public/` directory
2. **Build failures**: Check that all dependencies are in `package.json`
3. **Environment variables**: Verify they're set in Cloudflare Pages settings
4. **Large bundle size**: Use `npm run build:analyze` to identify large dependencies

### Debug Commands:
```bash
# Check build output
npm run build:pages && ls -la dist/

# Preview locally
npm run preview

# Check Wrangler configuration
wrangler pages project list
```

## Monitoring

- Use Cloudflare Analytics to monitor traffic and performance
- Set up alerts for deployment failures
- Monitor Core Web Vitals in the Cloudflare dashboard

## Custom Domain

To use a custom domain:
1. Go to Cloudflare Pages → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificates are automatically provisioned

---

**Note**: This configuration is optimized for React SPAs with client-side routing. The build process generates optimized, production-ready assets with proper caching and security headers.