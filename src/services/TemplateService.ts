import Handlebars from "handlebars";
import { readFile } from "fs/promises";
import { resolve } from "path";
import type { EmailTemplate, TemplateData } from "../types/email";
import { config } from "../config/app";
import { currentYear } from "../utils/dayjs";

// Template cache for compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Load and compile a template
 */
const loadTemplate = async (
  templateName: string
): Promise<HandlebarsTemplateDelegate> => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  // Use relative path from project root
  const templatePath = resolve(
    process.cwd(),
    "src",
    "templates",
    "html",
    `${templateName}.hbs`
  );
  const templateContent = await readFile(templatePath, "utf-8");
  const compiledTemplate = Handlebars.compile(templateContent);

  templateCache.set(templateName, compiledTemplate);
  return compiledTemplate;
};

/**
 * Generate plain text from HTML (basic HTML to text conversion)
 */
const htmlToText = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script blocks
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
    .trim();
};

/**
 * Render a template with data
 */
export const renderTemplate = async (
  templateName: string,
  data: TemplateData
): Promise<EmailTemplate> => {
  const templateData = {
    ...data,
    appName: config.app.name,
    currentYear: currentYear(),
  };

  const htmlTemplate = await loadTemplate(templateName);
  const renderedHtml = htmlTemplate(templateData);

  // Generate plain text from HTML
  const renderedText = htmlToText(renderedHtml);

  return {
    subject: data.subject,
    html: renderedHtml,
    text: renderedText,
  };
};
