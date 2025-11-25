import apiClient from './client';

/**
 * Export API service for downloading documents.
 * Handles DOCX and PPTX file downloads for a project.
 */
export const exportApi = {
  /**
   * Download the project as DOCX or PPTX file.
   * @param {number|string} projectId - Project ID to export.
   * @returns {Promise<boolean>} - Resolves true if download succeeds.
   */
  downloadDocument: async (projectId) => {
    try {
      // Ensure the parameter is a string or int (required for URL)
      if (!projectId) throw new Error('Invalid project ID');

      const response = await apiClient.get(
        `/export/projects/${projectId}/download`,
        {
          responseType: 'blob',
          headers: {
            'Accept':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation',
          },
          timeout: 60000, // 60 seconds for large files
        }
      );

      // Parse filename from Content-Disposition header (with broad fallback)
      let filename = 'document.docx';
      const contentDisposition =
        response.headers['content-disposition'] ||
        response.headers['Content-Disposition'];
      if (contentDisposition) {
        // RFC5987/6266: filename*= or filename=
        const encodedMatch = contentDisposition.match(
          /filename\*\s*=\s*([^;]+)/i
        );
        if (encodedMatch && encodedMatch[1]) {
          // Decode UTF-8 filenames
          filename = decodeURIComponent(encodedMatch[1].replace(/UTF-\d+''/, ''));
        } else {
          const normalMatch = contentDisposition.match(
            /filename[^;=\n]*=((['\"]).*?\2|[^;\n]*)/
          );
          if (normalMatch && normalMatch[1]) {
            filename = normalMatch[1].replace(/['"]/g, '');
          }
        }
      }

      // Trigger download as Blob
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const url = window.URL.createObjectURL(blob);

      // For cross-browser compatibility
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      // Network error (timeout, disconnected, CORS, etc.)
      if (!error.response) {
        throw new Error(
          'Network error while exporting. Check your connection and try again.'
        );
      }
      // Backend responded with an error (JSON, not file)
      if (
        error.response.data
        && error.response.data instanceof Blob
        && error.response.data.type === 'application/json'
      ) {
        try {
          // Read JSON error message
          const reader = new FileReader();
          return new Promise((_, reject) => {
            reader.onload = () => {
              try {
                const json = JSON.parse(reader.result);
                reject(json.detail || 'Failed to export document');
              } catch {
                reject('Failed to export document');
              }
            };
            reader.onerror = () => reject('Failed to export document');
            reader.readAsText(error.response.data);
          });
        } catch {
          throw new Error('Failed to export document.');
        }
      }

      // Standard error
      throw new Error(
        error.response?.data?.detail || error.message || 'Failed to export document.'
      );
    }
  },
};

