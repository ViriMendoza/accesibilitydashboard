# Dashboard de Accesibilidad

Herramienta para organizar, auditar y dar seguimiento a la accesibilidad de proyectos web con base en las **WCAG 2.2**. Combina un escaneo automático con [axe-core](https://github.com/dequelabs/axe-core) y un checklist de revisión manual, y calcula una puntuación por proyecto.

Construido con React y Vite. El propio dashboard está hecho para ser accesible: navegación por teclado, foco visible, landmarks, anuncios para lectores de pantalla y soporte para `prefers-reduced-motion`.

## Funcionalidades

### Resumen
- Indicadores generales: puntuación promedio, número de proyectos, incumplimientos abiertos y criterios por evaluar.
- Puntuación de cada proyecto en un anillo animado (verde ≥ 85, amarillo ≥ 60, rojo < 60).
- Cumplimiento por principio WCAG: Perceptible, Operable, Comprensible y Robusto.
- **Seguimiento de incumplimientos**: tabla con responsable y fecha límite de cada incumplimiento abierto, ordenada por vencimiento (vencidos primero).
- Los problemas más frecuentes entre todos los proyectos, para priorizar qué corregir primero.

### Proyectos y auditoría
- Alta de proyectos con nivel objetivo **WCAG A** o **AA**.
- Checklist de 26 criterios WCAG 2.2 agrupados por principio, con estados *Cumple*, *No cumple*, *Pendiente* y *No aplica*, y filtros por estado.
- **Responsable y fecha límite** en cada criterio marcado como *No cumple*, con aviso de "Vence en N días" o "Vencido". Los nombres ya usados se sugieren al escribir.
- Notas por proyecto.
- Exportación de un reporte en Markdown con el checklist (incluye responsables y fechas), el último escaneo y las notas.

### Historial
- Cada cambio guarda una foto diaria de la puntuación del proyecto; los escaneos también quedan registrados (hasta 50 por proyecto).
- Filtros por **proyecto**, **año** y **mes**.
- Indicadores del periodo: puntuación promedio al cierre, cambio en puntos y escaneos realizados.
- Gráfica de líneas animada con un color fijo por proyecto (paleta validada para daltonismo), leyenda, etiquetas finales y tooltip. También se recorre con las flechas del teclado.
- Tabla con todos los registros del periodo.
- Descarga del periodo filtrado en **CSV** (abre en Excel con acentos correctos) o como **reporte en Markdown** con resumen, tabla por proyecto, incumplimientos abiertos con responsable y registros.

### Escaneo automático con axe-core
- Escanea una **URL** o un fragmento de **HTML pegado**. La página se carga en un navegador real (Playwright + Chrome).
- Muestra las violaciones ordenadas por impacto (crítico, grave, moderado, menor), con el criterio WCAG relacionado, los elementos afectados y un enlace con instrucciones para corregirlas.
- **Aplicar al checklist**: marca como *No cumple* los criterios con violaciones y como *Cumple* los que pasaron sin errores. Solo cambia criterios que seguían *Pendiente*, así que una revisión manual nunca se sobrescribe.
- Guarda los últimos 10 escaneos de cada proyecto.

> Las herramientas automáticas detectan alrededor del 30–40 % de los problemas de accesibilidad. El checklist manual sigue siendo necesario.

### Consejos
- 21 buenas prácticas en 7 categorías (Semántica, Teclado, Color, Formularios, Multimedia, ARIA y Proceso), con buscador y ejemplos de código.

### Diseño
- Interfaz minimalista con modo claro y oscuro.
- Animaciones de llenado en anillos, barras y contadores, y entrada escalonada del contenido. Se desactivan si el sistema tiene activado "reducir movimiento".
- Diseño responsive para celular.

## Requisitos

- Node.js 18 o superior
- Google Chrome instalado, para el escaneo. Si no lo tienes, instala el Chromium de Playwright:

  ```bash
  npx playwright install chromium
  ```

## Instalación y uso

```bash
git clone git@github.com:ViriMendoza/accesibilitydashboard.git
cd accesibilitydashboard
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto http://localhost:5173).

| Comando           | Descripción                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con la API de escaneo         |
| `npm run build`   | Genera la versión de producción en `dist/`           |
| `npm run preview` | Sirve la versión de producción con la API de escaneo |

## Estructura

```
server/
  scan.js               # Escaneo con Playwright + axe-core y endpoint POST /api/scan
src/
  App.jsx               # Rutas por hash, tema, gestión del foco y anuncios
  components/
    Overview.jsx        # Vista de resumen
    Projects.jsx        # Lista y alta de proyectos
    ProjectDetail.jsx   # Checklist, notas y exportación
    Scanner.jsx         # Escaneo automático y resultados
    History.jsx         # Historial con filtros y descargas
    HistoryChart.jsx    # Gráfica de puntuación en el tiempo
    Tips.jsx            # Consejos de accesibilidad
    ScoreRing.jsx       # Anillo de puntuación animado
    ProgressBar.jsx     # Barras y números animados
    Sidebar.jsx         # Navegación principal
  data/
    criteria.js         # Criterios WCAG 2.2 y cálculo de puntuación
    tips.js             # Contenido de los consejos
    sampleProjects.js   # Proyectos de ejemplo
  hooks/
    useLocalStorage.js  # Persistencia local
    useAnimatedNumber.js  # Interpolación de valores para las animaciones
  utils/
    date.js             # Fechas locales y estado de vencimiento
    download.js         # Descarga de archivos y generación de CSV
  styles.css            # Estilos y tokens de color claro/oscuro
vite.config.js          # Registra /api/scan en el servidor de Vite
```

## Cómo se calcula la puntuación

```
puntuación = criterios que cumplen / criterios que aplican × 100
```

Los criterios marcados como *No aplica* no cuentan. Con meta **A** solo se consideran los criterios de nivel A.

## Datos

Los proyectos se guardan en el `localStorage` del navegador: cada persona y cada navegador tiene su propia copia. Para compartir resultados usa **Exportar reporte**.

## Próximos pasos

- [ ] Base de datos compartida para que todo el equipo vea los mismos proyectos
- [ ] `eslint-plugin-jsx-a11y` y escaneo en CI
