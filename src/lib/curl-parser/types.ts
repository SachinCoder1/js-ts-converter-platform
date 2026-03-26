export interface ParsedCurlCommand {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  bodyType: 'raw' | 'form-urlencoded' | 'multipart' | 'binary' | null;
  auth: { username: string; password: string } | null;
  cookies: string | null;
  followRedirects: boolean;
  insecure: boolean;
  compressed: boolean;
  output: string | null;
  formData: Array<{ name: string; value: string; isFile: boolean }> | null;
}
