# bellit.github.io

Web personal de Daniel Bellido (DBellido), publicada con GitHub Pages desde la rama `main`.

## Estructura

- `index.html`: web principal.
- `cv/`: currículum. No está enlazado desde la web principal.
- `css/base.css`: variables y componentes compartidos.
- `css/home.css`: secciones de la web principal, en el orden de la página.
- `css/cv.css`: estilos propios del currículum.
- `js/app.js`: comportamiento de ambas páginas.
- `img/`: capturas de los trabajos.
- `Web personal VERSIONES/`: versiones anteriores y propuestas de diseño, sin indexar. Es independiente de `css/` y `js/`; solo reutiliza `img/` y el favicon.

## En local

Es un sitio estático, así que basta con servirlo desde la raíz:

```bash
npx serve .
```
