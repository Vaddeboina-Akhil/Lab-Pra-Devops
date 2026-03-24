const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const outputPath = path.join(rootDir, "main-code-files.pdf");

const files = [
  "backend/server.js",
  "backend/package.json",
  "backend/Dockerfile",
  "frontend/src/App.jsx",
  "frontend/src/main.jsx",
  "frontend/src/App.css",
  "frontend/src/index.css",
  "frontend/package.json",
  "frontend/vite.config.mts",
  "Dockerfile",
  "nginx.conf",
  "Jenkinsfile",
  "k8s/deployment.yaml",
  "k8s/service.yaml",
];

const pageWidth = 612;
const pageHeight = 792;
const leftMargin = 50;
const topMargin = 50;
const headingFontSize = 16;
const bodyFontSize = 9;
const headingGap = 24;
const lineHeight = 11;
const usableWidth = pageWidth - leftMargin * 2;
const charsPerLine = Math.max(40, Math.floor(usableWidth / (bodyFontSize * 0.6)));

function escapePdfText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function normalizeText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function wrapLine(line, width) {
  if (!line) {
    return [""];
  }

  const wrapped = [];
  let remaining = line;
  const indentMatch = remaining.match(/^ +/);
  const indent = indentMatch ? indentMatch[0] : "";
  const continuationIndent = indent.slice(0, Math.min(indent.length, 12));

  while (remaining.length > width) {
    let splitAt = remaining.lastIndexOf(" ", width);
    if (splitAt <= 0) {
      splitAt = width;
    }

    wrapped.push(remaining.slice(0, splitAt));
    remaining = continuationIndent + remaining.slice(splitAt).trimStart();
  }

  wrapped.push(remaining);
  return wrapped;
}

function createPage() {
  return [];
}

const pages = [];

function addPage() {
  const page = createPage();
  pages.push(page);
  return page;
}

function addTextLine(page, fontKey, fontSize, x, y, text) {
  page.push(`BT /${fontKey} ${fontSize} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
}

for (const relativeFile of files) {
  const absolutePath = path.join(rootDir, relativeFile);
  if (!fs.existsSync(absolutePath)) {
    continue;
  }

  let page = addPage();
  let currentY = pageHeight - topMargin - headingFontSize;
  addTextLine(page, "F1", headingFontSize, leftMargin, currentY, relativeFile);
  currentY -= headingGap;

  const content = normalizeText(fs.readFileSync(absolutePath, "utf8"));
  const lines = content.split("\n");

  for (const rawLine of lines) {
    const wrappedLines = wrapLine(rawLine, charsPerLine);
    for (const wrappedLine of wrappedLines) {
      if (currentY < topMargin) {
        page = addPage();
        currentY = pageHeight - topMargin - headingFontSize;
        addTextLine(page, "F1", headingFontSize, leftMargin, currentY, `${relativeFile} (cont.)`);
        currentY -= headingGap;
      }

      addTextLine(page, "F2", bodyFontSize, leftMargin, currentY, wrappedLine);
      currentY -= lineHeight;
    }
  }
}

const objects = [];

function addObject(body) {
  objects.push(body);
  return objects.length;
}

const catalogId = addObject("");
const pagesId = addObject("");
const fontHeadingId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
const fontBodyId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

const pageObjectIds = [];

for (const pageLines of pages) {
  const stream = pageLines.join("\n");
  const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  const pageId = addObject(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 ${fontHeadingId} 0 R /F2 ${fontBodyId} 0 R >> >> ` +
      `/Contents ${contentId} 0 R >>`
  );
  pageObjectIds.push(pageId);
}

objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
objects[pagesId - 1] = `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
  .map((id) => `${id} 0 R`)
  .join(" ")}] >>`;

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";

for (let i = 1; i < offsets.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync(outputPath, pdf, "binary");
console.log(`Created ${outputPath}`);
