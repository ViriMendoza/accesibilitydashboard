export const TIP_CATEGORIES = ['Todos', 'Semántica', 'Teclado', 'Color', 'Formularios', 'Multimedia', 'ARIA', 'Proceso']

export const TIPS = [
  {
    category: 'Semántica',
    title: 'Usa elementos nativos antes que ARIA',
    body: 'Un <button> ya es enfocable, responde a Enter y Espacio y se anuncia como botón. Un <div onClick> no hace nada de eso.',
    code: `<!-- Evita -->\n<div class="btn" onclick="save()">Guardar</div>\n\n<!-- Prefiere -->\n<button type="button" onclick="save()">Guardar</button>`,
  },
  {
    category: 'Semántica',
    title: 'Un solo h1 y jerarquía sin saltos',
    body: 'Los lectores de pantalla navegan por encabezados. Pasa de h2 a h3, nunca de h2 a h4 solo por el tamaño visual: eso se resuelve con CSS.',
  },
  {
    category: 'Semántica',
    title: 'Define landmarks',
    body: 'Usa <header>, <nav>, <main>, <aside> y <footer>. Permiten saltar directamente a cada región.',
  },
  {
    category: 'Teclado',
    title: 'Nunca elimines el outline sin reemplazo',
    body: 'Usa :focus-visible para mostrar un anillo de foco claro solo a quien navega con teclado.',
    code: `:focus-visible {\n  outline: 2px solid #4f46e5;\n  outline-offset: 2px;\n}`,
  },
  {
    category: 'Teclado',
    title: 'Agrega un enlace "Saltar al contenido"',
    body: 'Debe ser el primer elemento enfocable y llevar a <main>. Puede ocultarse visualmente hasta que recibe foco.',
    code: `<a class="skip-link" href="#main">Saltar al contenido</a>\n...\n<main id="main" tabindex="-1">`,
  },
  {
    category: 'Teclado',
    title: 'Gestiona el foco en modales',
    body: 'Al abrir, mueve el foco dentro del modal; al cerrar, devuélvelo al botón que lo abrió. El elemento nativo <dialog> con showModal() ya lo hace.',
  },
  {
    category: 'Teclado',
    title: 'Evita tabindex positivo',
    body: 'tabindex="1" o mayores rompen el orden natural. Usa solo 0 (hacer enfocable) o -1 (enfocable por script).',
  },
  {
    category: 'Color',
    title: 'Verifica contraste desde el diseño',
    body: 'Revisa en Figma con plugins como Stark o Contrast. Corregir en diseño cuesta mucho menos que en desarrollo.',
  },
  {
    category: 'Color',
    title: 'No dependas solo del color',
    body: 'Un campo con error necesita además un icono y un mensaje de texto. Los enlaces dentro de un párrafo deben ir subrayados.',
  },
  {
    category: 'Color',
    title: 'Respeta las preferencias del usuario',
    body: 'Soporta modo oscuro y reduce animaciones para quien lo pide en su sistema.',
    code: `@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}`,
  },
  {
    category: 'Formularios',
    title: 'Cada input con su <label>',
    body: 'El placeholder no es una etiqueta: desaparece al escribir y suele tener bajo contraste.',
    code: `<label for="email">Correo electrónico</label>\n<input id="email" type="email" autocomplete="email" />`,
  },
  {
    category: 'Formularios',
    title: 'Asocia los mensajes de error',
    body: 'Usa aria-describedby para vincular el error y aria-invalid para marcar el estado.',
    code: `<input id="tel" aria-invalid="true" aria-describedby="tel-error" />\n<p id="tel-error">Ingresa 10 dígitos.</p>`,
  },
  {
    category: 'Formularios',
    title: 'Agrupa opciones relacionadas',
    body: 'Radios y checkboxes relacionados van dentro de <fieldset> con un <legend> que describa la pregunta.',
  },
  {
    category: 'Multimedia',
    title: 'Escribe alt según el contexto',
    body: 'Describe la función, no la apariencia. Un logo que enlaza al inicio: alt="Inicio – Toro Digital", no alt="logo".',
  },
  {
    category: 'Multimedia',
    title: 'Subtítulos y transcripciones',
    body: 'Los videos necesitan subtítulos; los podcasts, transcripción. Evita el autoplay con sonido.',
  },
  {
    category: 'ARIA',
    title: 'Botones de solo icono necesitan nombre',
    body: 'Agrega aria-label y oculta el SVG decorativo a los lectores de pantalla.',
    code: `<button aria-label="Cerrar">\n  <svg aria-hidden="true">...</svg>\n</button>`,
  },
  {
    category: 'ARIA',
    title: 'Anuncia cambios dinámicos',
    body: 'Usa una región aria-live="polite" para toasts, resultados de búsqueda o "guardado correctamente".',
    code: `<div role="status" aria-live="polite">{mensaje}</div>`,
  },
  {
    category: 'ARIA',
    title: 'Refleja estados con atributos',
    body: 'Acordeones y menús deben exponer aria-expanded; pestañas, aria-selected; navegación activa, aria-current="page".',
  },
  {
    category: 'Proceso',
    title: 'Automatiza lo automatizable',
    body: 'Integra axe-core, eslint-plugin-jsx-a11y o Lighthouse en CI. Detectan cerca del 30-40 % de los problemas; el resto requiere pruebas manuales.',
  },
  {
    category: 'Proceso',
    title: 'Prueba con lectores de pantalla reales',
    body: 'VoiceOver (macOS/iOS, Cmd+F5), NVDA (Windows, gratis) y TalkBack (Android). Basta con 15 minutos por flujo crítico.',
  },
  {
    category: 'Proceso',
    title: 'Incluye accesibilidad en la Definition of Done',
    body: 'Una historia no está terminada si no se puede usar con teclado y no pasa la revisión de contraste.',
  },
]
