import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const YAML_CONFIG_FILENAME = '../.env.yml';
const yamlConfig = yaml.load(
  fs.readFileSync(path.join(__dirname, '..', YAML_CONFIG_FILENAME), 'utf8'),
) as Record<string, any>;

Object.keys(yamlConfig).forEach(key => {
  process.env[key] = yamlConfig[key];
});

export * from './stripe.config';
