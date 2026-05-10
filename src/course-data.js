let courseCache = null;

async function loadCourseData() {
  if (courseCache) return courseCache;
  const response = await fetch("/course-data.json");
  courseCache = await response.json();
  return courseCache;
}

export async function getCourse() {
  return await loadCourseData();
}

export async function findUnit(unitId) {
  const course = await getCourse();
  return course.units.find((u) => u.id === unitId);
}

export function findTopic(unit, topicId) {
  return unit.topics.find((t) => t.id === topicId);
}

export function findActivity(unit, activityId) {
  return unit.activities.find((a) => a.id === activityId);
}
