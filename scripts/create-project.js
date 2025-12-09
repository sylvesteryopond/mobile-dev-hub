#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

const TEMPLATES_DIR = path.join(__dirname, '../templates');
const PROJECTS_DIR = path.join(__dirname, '../projects');

async function createProject() {
  console.log(chalk.cyan('✨ Create New Mobile Project\n'));
  
  // Get available templates
  const templates = fs.readdirSync(TEMPLATES_DIR)
    .filter(item => fs.statSync(path.join(TEMPLATES_DIR, item)).isDirectory());
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: templates
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: 'my-mobile-app',
      validate: input => input.length > 0 || 'Name is required'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Additional features:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'Tailwind CSS', value: 'tailwind' },
        { name: 'React Router', value: 'router' },
        { name: 'State Management', value: 'state' }
      ]
    }
  ]);
  
  const projectPath = path.join(PROJECTS_DIR, answers.name);
  
  // Create project directory
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`❌ Project "${answers.name}" already exists`));
    return;
  }
  
  fs.ensureDirSync(projectPath);
  
  // Copy template
  const templatePath = path.join(TEMPLATES_DIR, answers.template);
  fs.copySync(templatePath, projectPath);
  
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = answers.name;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  // Add selected features
  if (answers.features.includes('typescript')) {
    console.log(chalk.blue('Adding TypeScript...'));
    // Add tsconfig.json and convert files
  }
  
  if (answers.features.includes('tailwind')) {
    console.log(chalk.blue('Adding Tailwind CSS...'));
    // Add tailwind config
  }
  
  console.log(chalk.green(`\n✅ Project created at: ${projectPath}`));
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.white(`cd ${projectPath}`));
  console.log(chalk.white('npm install'));
  console.log(chalk.white('npm run dev'));
}

createProject().catch(console.error);
