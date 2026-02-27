import { readFile } from 'node:fs/promises';
import path from 'node:path';

type TemplateValue = string | number | null | undefined;

const EMAIL_TEMPLATE_DIR = path.join(process.cwd(), 'src', 'templates', 'emails');
const TEMPLATE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

function compileTemplate(template: string, variables: Record<string, TemplateValue>): string {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? '' : String(value);
  });
}

export async function renderEmailTemplate(templateName: string, variables: Record<string, TemplateValue>): Promise<string> {
  if (!TEMPLATE_NAME_PATTERN.test(templateName)) {
    throw new Error(`Invalid email template name: ${templateName}`);
  }

  const templatePath = path.join(EMAIL_TEMPLATE_DIR, `${templateName}.html`);
  const templateContent = await readFile(templatePath, 'utf-8').catch((error) => {
    throw new Error(`Failed to read email template "${templateName}": ${(error as Error).message}`);
  });

  return compileTemplate(templateContent, variables);
}
