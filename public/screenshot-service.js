
// This script takes a screenshot of the og-image.html page and saves it as an image
// It can be used as a build-time step to generate static OG images

document.addEventListener('DOMContentLoaded', () => {
  // Create a banner to show if someone navigates to this page directly
  if (window.location.pathname.includes('screenshot-service')) {
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.padding = '16px';
    banner.style.backgroundColor = '#f7931a';
    banner.style.color = '#fff';
    banner.style.textAlign = 'center';
    banner.style.fontSize = '16px';
    banner.style.zIndex = '9999';
    banner.innerHTML = 'This is a utility page for generating Open Graph images. <a href="/" style="color: #fff; text-decoration: underline;">Go to the main app</a>';
    document.body.appendChild(banner);
  }
});

// If you're using this script, you would use a library like puppeteer or html-to-image
// to generate actual screenshot images, but since we can't run Node.js here,
// this is mainly for demonstration
