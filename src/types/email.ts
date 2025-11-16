export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface TemplateData {
  subject: string;
  [key: string]: unknown;
}
