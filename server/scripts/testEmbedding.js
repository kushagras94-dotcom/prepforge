async function main() {
  const { pipeline } = await import('@xenova/transformers');
  const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const sentences = [
    'Built a MERN interview platform with a multi-turn AI engine',
    'Developed a full-stack web app using React and Node.js',
    'I love cooking pasta with fresh basil and garlic',
  ];

  const vectors = [];

  for (const s of sentences) {
    const output = await embed(s, { pooling: 'mean', normalize: true });
    const vector = Array.from(output.data);
    vectors.push(vector);
    console.log(s);
    console.log(vector.slice(0, 5));
    console.log('---');
  }

  function cosineSim(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }

  console.log('sim(1,2):', cosineSim(vectors[0], vectors[1]));
  console.log('sim(1,3):', cosineSim(vectors[0], vectors[2]));
  console.log('sim(2,3):', cosineSim(vectors[1], vectors[2]));
}

main();