import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntegrationService } from '../../../services/integration.service';
import { IntegrationConfig, INTEGRATION_TYPES, SYNC_FREQUENCIES, ENVIRONMENTS } from '../../../models/integration.model';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './integrations.html',
  styleUrl: './integrations.scss'
})
export class IntegrationsComponent implements OnInit {
  integrations: IntegrationConfig[] = [];
  integrationTypes = INTEGRATION_TYPES;
  syncFrequencies = SYNC_FREQUENCIES;
  environments = ENVIRONMENTS;
  
  showModal = false;
  isEditing = false;
  selectedIntegration: IntegrationConfig | null = null;
  
  formData: Partial<IntegrationConfig> = {};
  
  loading = false;
  testingConnection = false;
  syncingData = false;
  testResult: any = null;

  constructor(private integrationService: IntegrationService) {}

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.loading = true;
    this.integrationService.getAll().subscribe({
      next: (data) => {
        this.integrations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading integrations:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.formData = {
      integrationType: '',
      name: '',
      active: true,
      syncEnabled: false
    };
    this.testResult = null;
    this.showModal = true;
  }

  openEditModal(integration: IntegrationConfig): void {
    this.isEditing = true;
    this.selectedIntegration = integration;
    this.formData = { ...integration };
    this.testResult = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedIntegration = null;
    this.formData = {};
  }

  saveIntegration(): void {
    if (this.isEditing && this.selectedIntegration?.id) {
      this.integrationService.update(this.selectedIntegration.id, this.formData).subscribe({
        next: () => {
          this.loadIntegrations();
          this.closeModal();
        },
        error: (err) => console.error('Error updating integration:', err)
      });
    } else {
      this.integrationService.create(this.formData).subscribe({
        next: () => {
          this.loadIntegrations();
          this.closeModal();
        },
        error: (err) => console.error('Error creating integration:', err)
      });
    }
  }

  deleteIntegration(id: number): void {
    if (confirm('Are you sure you want to delete this integration?')) {
      this.integrationService.delete(id).subscribe({
        next: () => this.loadIntegrations(),
        error: (err) => console.error('Error deleting integration:', err)
      });
    }
  }

  toggleActive(id: number): void {
    this.integrationService.toggleActive(id).subscribe({
      next: () => this.loadIntegrations(),
      error: (err) => console.error('Error toggling integration:', err)
    });
  }

  testConnection(id: number): void {
    this.testingConnection = true;
    this.integrationService.testConnection(id).subscribe({
      next: (result) => {
        this.testResult = result;
        this.testingConnection = false;
        alert(result.success ? 'Connection successful!' : 'Connection failed: ' + result.message);
      },
      error: (err) => {
        console.error('Error testing connection:', err);
        this.testingConnection = false;
        alert('Connection test failed');
      }
    });
  }

  triggerSync(id: number): void {
    this.syncingData = true;
    this.integrationService.triggerSync(id, 'FULL').subscribe({
      next: (result) => {
        this.syncingData = false;
        alert(`Sync ${result.status === 'SUCCESS' ? 'completed successfully' : 'failed'}`);
        this.loadIntegrations();
      },
      error: (err) => {
        console.error('Error triggering sync:', err);
        this.syncingData = false;
        alert('Sync failed');
      }
    });
  }

  getIntegrationTypeName(type: string): string {
    const found = this.integrationTypes.find(t => t.code === type);
    return found ? found.name : type;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'QUICKBOOKS': return 'fa-calculator';
      case 'SAP': return 'fa-cubes';
      case 'ADP': return 'fa-users';
      case 'JIRA': return 'fa-tasks';
      case 'SMTP': return 'fa-envelope';
      case 'SMS': return 'fa-comment-sms';
      default: return 'fa-plug';
    }
  }

  showTypeSpecificFields(type: string): boolean {
    return !!type;
  }

  isAccountingType(): boolean {
    return ['QUICKBOOKS', 'SAP'].includes(this.formData.integrationType || '');
  }

  isPayrollType(): boolean {
    return this.formData.integrationType === 'ADP';
  }

  isProjectType(): boolean {
    return this.formData.integrationType === 'JIRA';
  }

  isSmtpType(): boolean {
    return this.formData.integrationType === 'SMTP';
  }

  isSmsType(): boolean {
    return this.formData.integrationType === 'SMS';
  }
}
