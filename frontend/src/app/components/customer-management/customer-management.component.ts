import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CustomerService, Customer, ClientContact, ClientNote, ClientDocument } from '../../services/customer.service';

@Component({
  selector: 'app-customer-management',
  standalone: false,
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {
  clients: Customer[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false;
  selectedClient: Customer = this.getEmptyClient();
  loading = false;
  dataReady = false;

  activeTab: string = 'profile';

  showContactModal: boolean = false;
  editContactMode: boolean = false;
  selectedContact: ClientContact = this.getEmptyContact();

  showNoteModal: boolean = false;
  newNote: string = '';

  showDocumentModal: boolean = false;
  selectedDocument: ClientDocument = this.getEmptyDocument();

  permissionOptions = [
    { value: 'invoices', label: 'View Invoices' },
    { value: 'projects', label: 'View Projects' },
    { value: 'tickets', label: 'Create Tickets' },
    { value: 'estimates', label: 'View Estimates' },
    { value: 'contracts', label: 'View Contracts' },
    { value: 'documents', label: 'View Documents' }
  ];

  constructor(private customerService: CustomerService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private completeLoading(): void {
    this.loading = false;
    this.dataReady = true;
  }

  loadClients(): void {
    this.loading = true;
    this.dataReady = false;
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.clients = data.map(c => ({
          ...c,
          contacts: c.contacts || [],
          invoices: c.invoices || [],
          payments: c.payments || [],
          projects: c.projects || [],
          tasks: c.tasks || [],
          tickets: c.tickets || [],
          notes: c.notes || [],
          documents: c.documents || [],
          contracts: c.contracts || []
        }));
        this.completeLoading();
      },
      error: (err) => {
        console.error('Error loading clients', err);
        this.completeLoading();
      }
    });
  }

  get filteredClients() {
    if (!this.searchQuery) return this.clients;
    return this.clients.filter(c => 
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptyClient(): Customer {
    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      customerGroup: '',
      status: 'Active',
      primaryContact: '',
      currency: 'USD',
      language: 'English',
      assignedStaff: '',
      billingAddress: '',
      defaultPaymentMethod: '',
      outstandingBalance: 0,
      contacts: [],
      invoices: [],
      payments: [],
      projects: [],
      tasks: [],
      tickets: [],
      notes: [],
      documents: [],
      contracts: []
    };
  }

  getEmptyContact(): ClientContact {
    return {
      name: '',
      email: '',
      phone: '',
      position: '',
      portalAccess: false,
      permissions: []
    };
  }

  getEmptyDocument(): ClientDocument {
    return {
      name: '',
      type: '',
      uploadDate: new Date().toISOString().split('T')[0]
    };
  }

  openModal(client?: Customer) {
    if (client) {
      this.editMode = true;
      this.viewMode = false;
      this.selectedClient = { 
        ...client,
        contacts: client.contacts || [],
        invoices: client.invoices || [],
        payments: client.payments || [],
        projects: client.projects || [],
        tasks: client.tasks || [],
        tickets: client.tickets || [],
        notes: client.notes || [],
        documents: client.documents || [],
        contracts: client.contracts || []
      };
    } else {
      this.editMode = false;
      this.viewMode = false;
      this.selectedClient = this.getEmptyClient();
    }
    this.activeTab = 'profile';
    this.showModal = true;
  }

  viewClient(client: Customer) {
    this.viewMode = true;
    this.editMode = false;
    this.selectedClient = { 
      ...client,
      contacts: client.contacts || [],
      invoices: client.invoices || [],
      payments: client.payments || [],
      projects: client.projects || [],
      tasks: client.tasks || [],
      tickets: client.tickets || [],
      notes: client.notes || [],
      documents: client.documents || [],
      contracts: client.contracts || []
    };
    this.activeTab = 'profile';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.viewMode = false;
    this.selectedClient = this.getEmptyClient();
    this.activeTab = 'profile';
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  saveClient(): void {
    if (this.editMode && this.selectedClient.id) {
      this.customerService.update(this.selectedClient.id, this.selectedClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (err) => console.error('Error updating client', err)
      });
    } else {
      this.customerService.create(this.selectedClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (err) => console.error('Error creating client', err)
      });
    }
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.customerService.delete(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Error deleting client', err)
      });
    }
  }

  openContactModal(contact?: ClientContact) {
    if (contact) {
      this.editContactMode = true;
      this.selectedContact = { ...contact };
    } else {
      this.editContactMode = false;
      this.selectedContact = this.getEmptyContact();
    }
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
    this.selectedContact = this.getEmptyContact();
  }

  saveContact() {
    if (!this.selectedClient.contacts) {
      this.selectedClient.contacts = [];
    }
    if (this.editContactMode && this.selectedContact.id !== undefined) {
      const index = this.selectedClient.contacts.findIndex(c => c.id === this.selectedContact.id);
      if (index !== -1) {
        this.selectedClient.contacts[index] = { ...this.selectedContact };
      }
    } else {
      this.selectedContact.id = Date.now();
      this.selectedClient.contacts.push({ ...this.selectedContact });
    }
    this.closeContactModal();
  }

  deleteContact(contactId: number) {
    if (confirm('Delete this contact?')) {
      this.selectedClient.contacts = this.selectedClient.contacts?.filter(c => c.id !== contactId) || [];
    }
  }

  togglePermission(permission: string) {
    if (!this.selectedContact.permissions) {
      this.selectedContact.permissions = [];
    }
    const index = this.selectedContact.permissions.indexOf(permission);
    if (index > -1) {
      this.selectedContact.permissions.splice(index, 1);
    } else {
      this.selectedContact.permissions.push(permission);
    }
  }

  hasPermission(permission: string): boolean {
    return this.selectedContact.permissions?.includes(permission) || false;
  }

  openNoteModal() {
    this.newNote = '';
    this.showNoteModal = true;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.newNote = '';
  }

  saveNote() {
    if (!this.selectedClient.notes) {
      this.selectedClient.notes = [];
    }
    const note: ClientNote = {
      id: Date.now(),
      content: this.newNote,
      createdBy: 'Current User',
      createdDate: new Date().toISOString()
    };
    this.selectedClient.notes.unshift(note);
    this.closeNoteModal();
  }

  deleteNote(noteId: number) {
    if (confirm('Delete this note?')) {
      this.selectedClient.notes = this.selectedClient.notes?.filter(n => n.id !== noteId) || [];
    }
  }

  openDocumentModal() {
    this.selectedDocument = this.getEmptyDocument();
    this.showDocumentModal = true;
  }

  closeDocumentModal() {
    this.showDocumentModal = false;
    this.selectedDocument = this.getEmptyDocument();
  }

  saveDocument() {
    if (!this.selectedClient.documents) {
      this.selectedClient.documents = [];
    }
    this.selectedDocument.id = Date.now();
    this.selectedClient.documents.push({ ...this.selectedDocument });
    this.closeDocumentModal();
  }

  deleteDocument(docId: number) {
    if (confirm('Delete this document?')) {
      this.selectedClient.documents = this.selectedClient.documents?.filter(d => d.id !== docId) || [];
    }
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active' || statusLower === 'paid' || statusLower === 'completed' || statusLower === 'closed' || statusLower === 'signed') return 'badge-success';
    if (statusLower === 'inactive' || statusLower === 'overdue' || statusLower === 'cancelled' || statusLower === 'expired') return 'badge-danger';
    if (statusLower === 'pending' || statusLower === 'in progress' || statusLower === 'open' || statusLower === 'draft') return 'badge-warning';
    return 'badge-info';
  }

  getPriorityClass(priority: string): string {
    const p = priority?.toLowerCase() || '';
    if (p === 'high' || p === 'critical') return 'badge-danger';
    if (p === 'medium') return 'badge-warning';
    return 'badge-info';
  }

  getActiveCount(): number {
    return this.clients.filter(c => c.status === 'Active').length;
  }

  getInactiveCount(): number {
    return this.clients.filter(c => c.status === 'Inactive').length;
  }

  getTotalOutstanding(): number {
    return this.clients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
