const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyCu9Dgemwdv7gfvRYAO28Wv9qY5metnoDo');
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        console.log("Model initialized");
        // We'll just test a text prompt first to see if the key and model are valid
        const result = await model.generateContent("Say hello");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
