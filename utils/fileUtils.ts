
// This function converts a markdown string to a basic HTML string.
// It processes content block by block for more accurate list generation.
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  const blocks = markdown.split(/\n\s*\n/); // Split by blank lines

  const htmlBlocks = blocks.map(block => {
    block = block.trim();
    if (!block) return '';

    // Headers
    if (block.startsWith('# ')) return `<h1>${block.substring(2)}</h1>`;
    if (block.startsWith('## ')) return `<h2>${block.substring(2)}</h2>`;
    if (block.startsWith('### ')) return `<h3>${block.substring(2)}</h3>`;

    // Unordered list
    if (block.startsWith('* ') || block.startsWith('- ')) {
      const items = block.split('\n').map(line => `<li>${line.substring(2)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }

    // Ordered list
    if (/^\d+\. /.test(block)) {
      const items = block.split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    }

    // Paragraph
    return `<p>${block.replace(/\n/g, '<br />')}</p>`;
  });

  let html = htmlBlocks.join('');

  // Apply inline formatting after block processing
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  
  return html;
};


export const saveAsDoc = (content: string, filename: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
          h1 { font-size: 16pt; font-weight: bold; }
          h2 { font-size: 14pt; font-weight: bold; }
          h3 { font-size: 12pt; font-weight: bold; }
          ul, ol { margin: 0; padding-left: 40px; }
          p { margin: 0; }
        </style>
      </head>
      <body>
        ${markdownToHtml(content)}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
