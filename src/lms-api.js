/**
 * Mock API para integración LMS (Moodle conceptual).
 * Simula endpoints para usuarios, progreso y calificaciones.
 */

const LMS_BASE_URL = 'https://mock-lms-saim.example.com/api'; // Simulado

export async function fetchUserProgress(userId) {
  // Simula fetch a LMS
  const mockData = {
    points: 150,
    missions: ['u1:a1', 'u1:a2'],
    lastActivity: 'u2:a1',
  };
  return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));
}

export async function submitGrade(activityId, score, userId) {
  // Simula envío de calificación
  console.log(`Enviando calificación: ${activityId} - ${score} para usuario ${userId}`);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300));
}

export async function syncProgress(localProgress) {
  // Simula sincronización con LMS
  console.log('Sincronizando progreso con LMS:', localProgress);
  return new Promise((resolve) => setTimeout(() => resolve({ synced: true }), 400));
}