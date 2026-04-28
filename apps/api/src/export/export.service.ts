import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { ExportResumeDto } from './dto/export-resume';
import { ExportResumeFile } from './export.types';

@Injectable()
export class ExportService {
  async exportResume(body: ExportResumeDto): Promise<ExportResumeFile> {
    const content = body.tailoredResume?.trim();

    if (!content) {
      throw new BadRequestException('tailoredResume is required');
    }

    const baseFileName = this.buildFileName(body.fileName);

    if (body.format === 'pdf') {
      const buffer = await this.buildPdf(content);

      return {
        buffer,
        fileName: `${baseFileName}.pdf`,
        mimeType: 'application/pdf',
      };
    }

    const buffer = await this.buildDocx(content);

    return {
      buffer,
      fileName: `${baseFileName}.docx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  private buildFileName(fileName?: string): string {
    const normalized = (fileName ?? 'tailored-resume')
      .trim()
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9-_ ]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return normalized || 'tailored-resume';
  }

  private async buildDocx(content: string): Promise<Buffer> {
    const paragraphs = content
      .split('\n')
      .map((line) => line.trimEnd())
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 160 },
          });
        }

        if (/^[-*•]\s+/.test(trimmed)) {
          return new Paragraph({
            text: trimmed.replace(/^[-*•]\s+/, ''),
            bullet: { level: 0 },
            spacing: { after: 120 },
          });
        }

        return new Paragraph({
          text: trimmed,
          spacing: { after: 140 },
        });
      });

    const document = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    return Packer.toBuffer(document);
  }

  private async buildPdf(content: string): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const lineHeight = 16;
    const marginX = 50;
    const marginTop = 56;
    const marginBottom = 56;
    const maxWidth = 495;

    let page = pdf.addPage([595, 842]);
    let currentY = page.getHeight() - marginTop;

    const writeLine = (line: string) => {
      page.drawText(line, {
        x: marginX,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.18, 0.16, 0.18),
      });
      currentY -= lineHeight;
    };

    const ensureRoom = () => {
      if (currentY >= marginBottom) {
        return;
      }

      page = pdf.addPage([595, 842]);
      currentY = page.getHeight() - marginTop;
    };

    for (const rawLine of content.split('\n')) {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        currentY -= lineHeight * 0.6;
        ensureRoom();
        continue;
      }

      const lines = this.wrapPdfText(trimmed, font, fontSize, maxWidth);
      for (const line of lines) {
        ensureRoom();
        writeLine(line);
      }
    }

    return Buffer.from(await pdf.save());
  }

  private wrapPdfText(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number,
  ): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      const nextWidth = font.widthOfTextAtSize(nextLine, fontSize);

      if (nextWidth <= maxWidth) {
        currentLine = nextLine;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
