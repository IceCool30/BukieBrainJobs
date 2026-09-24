// apps/web/components/brainworker/onboarding/DocumentUploadCard.test.tsx
// Phase 3 RED: Document Staging & Preview Card Component Contract Tests (DOC-001 through DOC-009)
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.2 & 6)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4 & 4)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 4: DOC-001 to DOC-009)

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DocumentUploadCard,
  type DocumentUploadCardProps,
} from './DocumentUploadCard';
import type { StagedDocument } from '../../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-001 Suite 4: DocumentUploadCard Component (DOC-001 through DOC-009)', () => {
  const mockImageStagedDoc: StagedDocument = {
    id: 'doc-img-123',
    category: 'GOVERNMENT_ID',
    specificType: 'NATIONAL_EID',
    fileName: 'national-id.jpg',
    fileSizeBytes: 2_400_000,
    mimeType: 'image/jpeg',
    stagedAt: '2026-09-24T06:00:00.000Z',
    previewUrl: 'blob:https://bukiebrainjobs.com/preview-img-123',
  };

  const mockPdfStagedDoc: StagedDocument = {
    id: 'doc-pdf-456',
    category: 'TRADE_CREDENTIAL',
    specificType: 'TRADE_TEST_CERTIFICATE',
    fileName: 'trade-certificate.pdf',
    fileSizeBytes: 1_500_000,
    mimeType: 'application/pdf',
    stagedAt: '2026-09-24T06:00:00.000Z',
  };

  const defaultProps: DocumentUploadCardProps = {
    id: 'test-upload-card',
    label: 'National e-ID Card / NIN Slip (NIMC)',
    description: 'Upload front and back or a clear NIN slip photo',
    category: 'GOVERNMENT_ID',
    specificType: 'NATIONAL_EID',
    onChange: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      if (!window.URL.createObjectURL) {
        window.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
      }
      if (!window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL = vi.fn();
      }
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-001: Dropzone Anatomy & Supported Format Guidance
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-001: Dropzone Anatomy & Format Guidance', () => {
    it('renders label and description', () => {
      render(<DocumentUploadCard {...defaultProps} />);
      expect(
        screen.getByText('National e-ID Card / NIN Slip (NIMC)')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Upload front and back or a clear NIN slip photo')
      ).toBeInTheDocument();
    });

    it('indicates supported formats and 5 MB ceiling notice', () => {
      render(<DocumentUploadCard {...defaultProps} />);
      expect(
        screen.getByText(/JPG, PNG, WEBP, or PDF up to 5 MB/i)
      ).toBeInTheDocument();
    });

    it('renders file input with correct accept attribute', () => {
      render(<DocumentUploadCard {...defaultProps} />);
      const input = screen.getByTestId('document-file-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('file');
      expect(input.accept).toBe('image/jpeg,image/png,image/webp,application/pdf');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-002: Exact 5 MB Ceiling Enforcement & Rejection Feedback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-002: 5 MB Ceiling Enforcement', () => {
    it('displays error when selected file exceeds 5 MB limit and rejects call to onChange', () => {
      const onChange = vi.fn();
      render(<DocumentUploadCard {...defaultProps} onChange={onChange} />);

      const fileInput = screen.getByTestId('document-file-input');
      const oversizedFile = new File(['x'.repeat(100)], 'huge-passport.jpg', {
        type: 'image/jpeg',
      });
      // Override size to 5,242,881 bytes (5 MB + 1 byte)
      Object.defineProperty(oversizedFile, 'size', {
        value: 5 * 1024 * 1024 + 1,
      });

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/File size exceeds 5 MB limit/i);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('accepts file of exactly 5 MB (5,242,880 bytes) and calls onChange', () => {
      const onChange = vi.fn();
      render(<DocumentUploadCard {...defaultProps} onChange={onChange} />);

      const fileInput = screen.getByTestId('document-file-input');
      const exactLimitFile = new File(['valid'], 'exact-limit.png', {
        type: 'image/png',
      });
      Object.defineProperty(exactLimitFile, 'size', {
        value: 5 * 1024 * 1024,
      });

      fireEvent.change(fileInput, { target: { files: [exactLimitFile] } });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'exact-limit.png',
          size: 5 * 1024 * 1024,
          type: 'image/png',
          category: 'GOVERNMENT_ID',
          specificType: 'NATIONAL_EID',
        })
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-003: Unsupported MIME Type Rejection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-003: MIME Whitelist Validation', () => {
    it('displays error and rejects unsupported MIME types (e.g. DOCX, text)', () => {
      const onChange = vi.fn();
      render(<DocumentUploadCard {...defaultProps} onChange={onChange} />);

      const fileInput = screen.getByTestId('document-file-input');
      const unsupportedFile = new File(['text content'], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      Object.defineProperty(unsupportedFile, 'size', { value: 2048 });

      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(
        /Unsupported file format\. Please upload JPEG, PNG, WEBP, or PDF/i
      );
      expect(onChange).not.toHaveBeenCalled();
    });

    it('displays error and rejects empty 0-byte file', () => {
      const onChange = vi.fn();
      render(<DocumentUploadCard {...defaultProps} onChange={onChange} />);

      const fileInput = screen.getByTestId('document-file-input');
      const emptyFile = new File([], 'empty.png', { type: 'image/png' });
      Object.defineProperty(emptyFile, 'size', { value: 0 });

      fireEvent.change(fileInput, { target: { files: [emptyFile] } });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/File is empty \(0 bytes\)/i);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-004: Image Thumbnail Preview (JPEG, PNG, WebP)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-004: Image Thumbnail Preview', () => {
    it('renders image thumbnail preview with alt text, filename, and formatted size', () => {
      render(
        <DocumentUploadCard {...defaultProps} value={mockImageStagedDoc} />
      );

      const img = screen.getByRole('img', { name: /national-id\.jpg/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockImageStagedDoc.previewUrl);

      expect(screen.getByText('national-id.jpg')).toBeInTheDocument();
      expect(screen.getByText(/2\.4 MB|2\.3 MB/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/JPG, PNG, WEBP, or PDF up to 5 MB/i)
      ).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-005: Accessible Document Card Presentation for PDF Uploads
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-005: PDF Document Card Presentation', () => {
    it('renders accessible PDF card with filename, formatted size, and PDF badge without <img> tag', () => {
      render(<DocumentUploadCard {...defaultProps} value={mockPdfStagedDoc} />);

      expect(screen.getByText('trade-certificate.pdf')).toBeInTheDocument();
      expect(screen.getByText(/1\.5 MB|1\.4 MB/i)).toBeInTheDocument();
      expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-006: Document Removal Action
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-006: Document Removal Action', () => {
    it('renders accessible Remove button and invokes onRemove with document id', () => {
      const onRemove = vi.fn();
      render(
        <DocumentUploadCard
          {...defaultProps}
          value={mockImageStagedDoc}
          onRemove={onRemove}
        />
      );

      const removeBtn = screen.getByRole('button', {
        name: /remove national-id\.jpg|remove/i,
      });
      expect(removeBtn).toBeInTheDocument();

      fireEvent.click(removeBtn);
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith(mockImageStagedDoc.id);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-007: Document Replacement & Drag-and-Drop Interaction
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-007: Document Replacement & Drag-and-Drop', () => {
    it('renders Replace button and clicking it activates file input', () => {
      render(
        <DocumentUploadCard {...defaultProps} value={mockImageStagedDoc} />
      );

      const replaceBtn = screen.getByRole('button', {
        name: /replace national-id\.jpg|replace/i,
      });
      expect(replaceBtn).toBeInTheDocument();

      const fileInput = screen.getByTestId('document-file-input');
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(replaceBtn);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('processes file drop on dropzone and invokes onChange', () => {
      const onChange = vi.fn();
      render(<DocumentUploadCard {...defaultProps} onChange={onChange} />);

      const dropzone = screen.getByTestId('document-dropzone');
      const validFile = new File(['dummy content'], 'dropped-id.png', {
        type: 'image/png',
      });
      Object.defineProperty(validFile, 'size', { value: 1024 * 500 }); // 500 KB

      fireEvent.dragOver(dropzone);
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [validFile],
        },
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'dropped-id.png',
          type: 'image/png',
          category: 'GOVERNMENT_ID',
        })
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-008: Disabled, Submitted & Read-Only Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-008: Disabled State Invariants', () => {
    it('disables file input and ignores drops when disabled={true}', () => {
      const onChange = vi.fn();
      render(
        <DocumentUploadCard
          {...defaultProps}
          disabled={true}
          onChange={onChange}
        />
      );

      const fileInput = screen.getByTestId('document-file-input');
      expect(fileInput).toBeDisabled();

      const dropzone = screen.getByTestId('document-dropzone');
      const validFile = new File(['content'], 'attempted.png', {
        type: 'image/png',
      });
      Object.defineProperty(validFile, 'size', { value: 1024 });

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [validFile],
        },
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables or omits Remove/Replace buttons when disabled={true} on staged doc', () => {
      const onRemove = vi.fn();
      render(
        <DocumentUploadCard
          {...defaultProps}
          value={mockImageStagedDoc}
          disabled={true}
          onRemove={onRemove}
        />
      );

      const removeBtn = screen.queryByRole('button', {
        name: /remove/i,
      });
      const replaceBtn = screen.queryByRole('button', {
        name: /replace/i,
      });

      if (removeBtn) {
        expect(removeBtn).toBeDisabled();
      } else {
        expect(removeBtn).toBeNull();
      }

      if (replaceBtn) {
        expect(replaceBtn).toBeDisabled();
      } else {
        expect(replaceBtn).toBeNull();
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOC-009: Accessibility Announcements & Single Authority Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('DOC-009: Accessibility Announcements & Authority Boundary', () => {
    it('provides status announcement container with role="status" and aria-live="polite"', () => {
      render(
        <DocumentUploadCard {...defaultProps} value={mockImageStagedDoc} />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveTextContent(/national-id\.jpg/i);
    });

    it('never renders "Verified" or "Approved" badges on staged documents', () => {
      render(
        <DocumentUploadCard {...defaultProps} value={mockImageStagedDoc} />
      );

      expect(screen.queryByText(/^Verified$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Approved$/i)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('verified-provider-badge')
      ).not.toBeInTheDocument();
    });

    it('adheres to physical boundary: production component does not import from testing/', () => {
      const prodFilePath = path.resolve(
        __dirname,
        './DocumentUploadCard.tsx'
      );
      const fileContent = fs.readFileSync(prodFilePath, 'utf-8');

      expect(fileContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(fileContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    });
  });
});
