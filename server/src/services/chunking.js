function chunkResume(resume) {
  const chunks = [];
  let index = 0;

  if (resume.skills && resume.skills.length > 0) {
    chunks.push({
      chunkText: `Skills: ${resume.skills.join(', ')}`,
      section: 'skills',
      chunkIndex: index++,
    });
  }

  for (const entry of resume.experience || []) {
    chunks.push({ chunkText: entry, section: 'experience', chunkIndex: index++ });
  }

  for (const entry of resume.projects || []) {
    chunks.push({ chunkText: entry, section: 'project', chunkIndex: index++ });
  }

  if (resume.summary) {
    chunks.push({ chunkText: resume.summary, section: 'summary', chunkIndex: index++ });
  }

  return chunks;
}

module.exports = { chunkResume };