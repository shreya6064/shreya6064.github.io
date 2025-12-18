export function createHeader({
  container = document.body,
  links = [
    { label: 'Home', href: './index.html' },
    { label: 'Projects', href: './projects.html' },
    { label: 'About', href: './about.html' },
    { label: 'Contact', href: './contact.html' },
  ],
} = {}) {
  // Inject CSS once
  if (!document.querySelector('link[data-header-css]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/styles/header.css';
    link.dataset.headerCss = 'true';
    document.head.appendChild(link);
  }

  const header = document.createElement('header');
  header.className = 'site-header';

  const nav = document.createElement('nav');

  links.forEach(({ label, href }) => {
    const a = document.createElement('a');
    a.textContent = label;
    a.href = href;
    nav.appendChild(a);
  });

  header.appendChild(nav);
  container.appendChild(header);

  return header;
}
