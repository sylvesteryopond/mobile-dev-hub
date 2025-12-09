#!/usr/bin/env node
const { Configuration, OpenAIApi } = require('openai');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load config
const configPath = path.join(__dirname, '../config/ai-config.json');
let config = {};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  console.log(chalk.yellow('⚠️  No AI config found. Please set your OpenAI API key.'));
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({
  apiKey: config.apiKey
}));

async function generateCode(prompt, context = '') {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful coding assistant for mobile development. Generate clean, modern code.${context}`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error(chalk.red('❌ AI Error:'), error.message);
    return null;
  }
}

function extractCodeBlocks(text) {
  const codeBlocks = [];
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    codeBlocks.push(match[1]);
  }
  
  return codeBlocks.length > 0 ? codeBlocks : [text];
}

async function main() {
  console.log(chalk.cyan('🤖 Mobile Dev AI Assistant'));
  console.log(chalk.dim('Type your coding request or "quit" to exit\n'));
  
  while (true) {
    const prompt = await new Promise(resolve => {
      rl.question(chalk.green('> '), resolve);
    });
    
    if (prompt.toLowerCase() === 'quit') break;
    
    console.log(chalk.dim('Thinking...'));
    
    const context = fs.readFileSync(
      path.join(__dirname, '../templates/react-vite/App.jsx'), 
      'utf8'
    ).slice(0, 500);
    
    const response = await generateCode(prompt, `Current code context: ${context}`);
    
    if (response) {
      const codeBlocks = extractCodeBlocks(response);
      
      console.log(chalk.blue('\n💡 Suggested Code:\n'));
      codeBlocks.forEach((block, i) => {
        console.log(chalk.yellow(`--- Block ${i + 1} ---`));
        console.log(chalk.white(block));
        console.log('');
      });
      
      // Ask if user wants to save
      rl.question(chalk.cyan('Save to file? (y/n): '), (answer) => {
        if (answer.toLowerCase() === 'y') {
          const fileName = `ai-generated-${Date.now()}.js`;
          fs.writeFileSync(fileName, codeBlocks[0]);
          console.log(chalk.green(`✅ Saved as ${fileName}`));
        }
      });
    }
  }
  
  rl.close();
}

main();
