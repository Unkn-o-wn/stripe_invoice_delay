import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  const YAML_CONFIG_FILENAME = '../.env.yml';
  const configPath = path.join(__dirname, '..', YAML_CONFIG_FILENAME);

  try {
    if (fs.existsSync(configPath)) {
      const yamlConfig = yaml.load(fs.readFileSync(configPath, 'utf8')) as Record<string, any>;

      Object.keys(yamlConfig).forEach(key => {
        if (!process.env[key]) {
          process.env[key] = yamlConfig[key];
        }
      });

      console.log('✅ Loaded .env.yml configuration');
    } else {
      console.warn(`⚠️ File ${configPath} not found. Skipping YAML config load.`);
    }
  } catch (err) {
    console.error(`❌ Failed to load ${configPath}:`, err);
  }
}

export * from './stripe.config';
