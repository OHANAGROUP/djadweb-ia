const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBlLSyc90F0_ETgnqg4eTJDdXp0RonGNQY');
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hola');
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}
test();
