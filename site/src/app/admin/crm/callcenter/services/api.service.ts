import { Extension, ExtensionFormData, Call, CDRRecord, CallFilter, CallSummary } from '../types/callcenter.types';

export class CallCenterAPIService {
  private static baseUrl = '/api/callcenter';

  // Extensions CRUD operations
  static async getExtensions(): Promise<Extension[]> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions`);
      if (!response.ok) throw new Error('Failed to fetch extensions');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching extensions:', error);
      throw error;
    }
  }

  static async getExtension(id: string): Promise<Extension> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch extension');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching extension:', error);
      throw error;
    }
  }

  static async createExtension(extensionData: ExtensionFormData): Promise<Extension> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extensionData),
      });
      if (!response.ok) throw new Error('Failed to create extension');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating extension:', error);
      throw error;
    }
  }

  static async updateExtension(id: string, extensionData: Partial<ExtensionFormData>): Promise<Extension> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extensionData),
      });
      if (!response.ok) throw new Error('Failed to update extension');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating extension:', error);
      throw error;
    }
  }

  static async deleteExtension(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete extension');
    } catch (error) {
      console.error('Error deleting extension:', error);
      throw error;
    }
  }

  // Call history and CDR operations
  static async getCalls(filter?: CallFilter): Promise<Call[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/calls?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch calls');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  static async getCallSummary(filter?: CallFilter): Promise<CallSummary> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/calls/summary?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch call summary');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching call summary:', error);
      throw error;
    }
  }

  static async updateCallNotes(callId: string, notes: string): Promise<Call> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to update call notes');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating call notes:', error);
      throw error;
    }
  }

  // Users for extension assignment
  static async getUsers(): Promise<any[]> {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Export calls data
  static async exportCalls(filter?: CallFilter, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      params.append('format', format);

      const response = await fetch(`${this.baseUrl}/calls/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export calls');
      return await response.blob();
    } catch (error) {
      console.error('Error exporting calls:', error);
      throw error;
    }
  }
}
