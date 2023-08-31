import './index.scss';

const pageNames = window.pageNames;
const parse = (str: string) =>
  str
    .split('-')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(' ');

document.body.innerHTML = `
  <main>
    <p>Some projects use the WebGPU API, so they may not display properly depending on your device and browser environment.</p>
    <ul class="page-list">
      ${pageNames
        .map(
          (page) => `
        <li>
          <a href="./pages/${page}/">
            <img src="./thumbnails/${page}.png" alt="${parse(page)}">
            <span>${parse(page)}</span>
          </a>
        </li>
      `,
        )
        .join('')}
    </ul>
  </main>
`;
