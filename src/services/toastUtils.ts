
// Toast utilities extracted from main.tsx to make the main entry point smaller and faster

export function showUpdateToast(sw: ServiceWorker) {
  // We're using shadcn/toast system for notification
  const id = 'pwa-update-banner';
  if (document.getElementById(id)) return; // Prevent duplicates

  // Use shadcn toast if possible, else fallback to a div
  if (window && (window as any).showToast) {
    (window as any).showToast({
      title: "Update verfügbar!",
      description: "Eine neue Version von Convy ist da. Klicke zum Aktualisieren.",
      action: {
        label: "Neu laden",
        onClick: () => {
          sw.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    });
    return;
  }

  // Fallback: simple banner
  const banner = document.createElement('div');
  banner.id = id;
  banner.style.position = 'fixed';
  banner.style.bottom = '0';
  banner.style.left = '0';
  banner.style.right = '0';
  banner.style.background = '#FFD600';
  banner.style.color = '#222';
  banner.style.textAlign = 'center';
  banner.style.zIndex = '9999';
  banner.style.padding = '1em';
  banner.style.fontSize = '1rem';
  banner.style.boxShadow = '0 -2px 8px rgba(0,0,0,0.15)';
  banner.innerHTML = `Neue Version verfügbar. <button style="margin-left: 1em;padding:0.25em 0.75em;border-radius:0.3em;border:none;background:#222;color:#FFD600;cursor:pointer;">Neu laden</button>`;
  banner.querySelector('button')?.addEventListener('click', () => {
    sw.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
  });
  document.body.appendChild(banner);
}
