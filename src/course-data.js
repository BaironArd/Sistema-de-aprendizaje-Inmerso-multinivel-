/** Curso demo — refleja Unidad → Temática → Actividad (Moodle como contenedor conceptual). */
export const course = {
  title: 'Sistema de Aprendizaje Inmersivo Multinivel (SAIM)',
  subtitle:
    'Prototipo ejecutable: exploración 3D (Three.js), actividad en pantalla dividida y WebAR en el navegador (AR.js + A-Frame).',
  units: [
    {
      id: 'u1',
      title: 'Diseño de sistemas interactivos',
      summary:
        'Organiza el aprendizaje desde la visión general hasta la práctica inmersiva, sin saltar entre herramientas desconectadas.',
      topics: [
        {
          id: 't1',
          title: 'Conceptos abstractos en 3D',
          blurb:
            'Espacio exploratorio previo a la teoría formal: rotar y acercar un modelo para generar contexto visual.',
          modelPreset: 'layers',
          activityId: 'a1',
        },
        {
          id: 't2',
          title: 'Flujo usuario–sistema',
          blurb:
            'Visualización de capas de interacción antes de leer el material: reduce carga cognitiva al llegar a la actividad.',
          modelPreset: 'nodes',
          activityId: 'a2',
        },
      ],
      activities: [
        {
          id: 'a1',
          title: 'Misión: integrar teoría, reto y AR',
          intro:
            'Nivel micro — máxima innovación: una sola vista aloja contexto teórico, reto gamificado y simulación WebAR (iframe). Usa tu dispositivo (BYOD) y, si tienes cámara, imprime o muestra el marcador Hiro frente al visor AR del panel derecho.',
          theory: `
            <p><strong>Contexto teórico</strong> — La pantalla dividida evita la fragmentación: no cerramos pestañas ni abrimos apps externas; todo vive en el mismo flujo de trabajo.</p>
            <p>En producción, este panel se alimentaría desde el LMS (p. ej. Moodle: libro, página o H5P embebido).</p>
            <ul>
              <li><strong>Unidad:</strong> organiza el módulo y la ruta.</li>
              <li><strong>Temática:</strong> exploración inmersiva previa.</li>
              <li><strong>Actividad:</strong> transformación del aprendizaje con práctica y feedback.</li>
            </ul>
          `,
          quiz: [
            {
              id: 'q1',
              prompt: '¿Qué problema pedagógico ataca principalmente el flujo en pantalla dividida?',
              options: [
                { id: 'o1', text: 'Falta de color en las diapositivas', correct: false },
                { id: 'o2', text: 'Saltos entre plataformas y fricción cognitiva', correct: true },
                { id: 'o3', text: 'Exceso de memorización verbal', correct: false },
              ],
            },
            {
              id: 'q2',
              prompt: 'En el stack propuesto, ¿qué rol cumple el LMS base?',
              options: [
                { id: 'o1', text: 'Solo almacenar videos', correct: false },
                { id: 'o2', text: 'Usuarios, rutas, calificaciones y reportes', correct: true },
                { id: 'o3', text: 'Reemplazar por completo el navegador', correct: false },
              ],
            },
          ],
          missionPoints: 120,
        },
        {
          id: 'a2',
          title: 'Misión: BYOD y validación',
          intro:
            'Estrategia BYOD: observa la simulación, practica en tu entorno local (por ejemplo editor + Git) y valida entregables en el ecosistema del curso. Este prototipo simula la validación con el cuestionario y los puntos.',
          theory: `
            <p><strong>BYOD (Bring Your Own Device)</strong> convierte el teléfono o portátil del estudiante en extensión del aula virtual.</p>
            <p><strong>Observa</strong> — WebAR y reto en la misma sesión.<br/>
            <strong>Practica</strong> — herramientas locales habituales (IDE, repo).<br/>
            <strong>Valida</strong> — entrega y retroalimentación en el LMS.<br/>
            <strong>Gana</strong> — puntos y recompensas dentro del sistema gamificado.</p>
          `,
          quiz: [
            {
              id: 'q1',
              prompt: '¿Por qué WebAR en navegador encaja con BYOD?',
              options: [
                { id: 'o1', text: 'Porque obliga a comprar licencias por aula', correct: false },
                {
                  id: 'o2',
                  text: 'Porque no exige instalar apps nativas y corre en el dispositivo del alumno',
                  correct: true,
                },
                { id: 'o3', text: 'Porque elimina la necesidad de cámara', correct: false },
              ],
            },
          ],
          missionPoints: 80,
        },
      ],
    },
    {
      id: 'u2',
      title: 'Evaluación y participación',
      summary:
        'Cierre del ciclo con indicadores de participación y flujo continuo entre teoría, práctica y feedback.',
      topics: [
        {
          id: 't1',
          title: 'Retroalimentación inmediata',
          blurb:
            'Modelo 3D simple como metáfora de “cerrar el circuito” entre intento, corrección y refuerzo.',
          modelPreset: 'circuit',
          activityId: 'a1',
        },
      ],
      activities: [
        {
          id: 'a1',
          title: 'Misión: medir compromiso',
          intro:
            'Impacto pedagógico: ecosistema unificado en lugar de más herramientas sueltas. Resuelve el mini-reto para sumar puntos.',
          theory: `
            <p>Métricas típicas de un piloto: participación en actividades, retención en el módulo y rendimiento en evaluaciones formativas.</p>
            <p>Este demo guarda <strong>puntos y misiones completadas</strong> en <code>localStorage</code> para simular persistencia hasta integrar con Moodle.</p>
          `,
          quiz: [
            {
              id: 'q1',
              prompt: '¿Qué afirma el enfoque SAIM sobre las herramientas existentes?',
              options: [
                { id: 'o1', text: 'Que hay que añadir más apps sin integrarlas', correct: false },
                { id: 'o2', text: 'Que hay que unificar el flujo en lugar de fragmentarlo', correct: true },
                { id: 'o3', text: 'Que el LMS debe eliminarse', correct: false },
              ],
            },
          ],
          missionPoints: 100,
        },
      ],
    },
  ],
};

export function findUnit(unitId) {
  return course.units.find((u) => u.id === unitId);
}

export function findTopic(unit, topicId) {
  return unit?.topics.find((t) => t.id === topicId);
}

export function findActivity(unit, activityId) {
  return unit?.activities.find((a) => a.id === activityId);
}
