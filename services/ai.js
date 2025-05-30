const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const HF_API_KEY = process.env.HF_API_KEY;

const generateSkillsFromDescription = async (description) => {
  console.log("🚀 Entered generateSkillsFromDescription");

  const response = await fetch(
    'https://api-inference.huggingface.co/models/dslim/bert-base-NER',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: description }),
    }
  );

  const rawText = await response.text();
  console.log("📦 Raw response from HuggingFace:", rawText);

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (err) {
    throw new Error("❌ Failed to parse HuggingFace response as JSON");
  }

  const skills = [...new Set(result.map(entity => entity.word.replace(/^##/, '')))];
  return skills;
};

module.exports = {
  generateSkillsFromDescription,
};