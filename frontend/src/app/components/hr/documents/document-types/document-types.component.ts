import { Component, OnInit } from '@angular/core';
import { DocumentService, DocumentCategory, DocumentType } from '../../../../services/document.service';

@Component({
  selector: 'app-document-types',
  standalone: false,
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.scss']
})
export class DocumentTypesComponent implements OnInit {
  documentTypes: DocumentType[] = [];
  categories: DocumentCategory[] = [];
  filteredTypes: DocumentType[] = [];
  
  selectedCategoryId: number | null = null;
  searchTerm = '';
  
  showModal = false;
  isEditMode = false;
  editing: DocumentType = this.getEmptyType();
  
  showCategoryModal = false;
  isEditCategoryMode = false;
  editingCategory: DocumentCategory = this.getEmptyCategory();

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.documentService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
    this.documentService.getAllTypes().subscribe({
      next: (data) => {
        this.documentTypes = data;
        this.filterTypes();
      },
      error: (err) => console.error('Error loading document types:', err)
    });
  }

  filterTypes() {
    let filtered = this.documentTypes;
    
    if (this.selectedCategoryId) {
      filtered = filtered.filter(t => t.category?.id === this.selectedCategoryId);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) || 
        t.code.toLowerCase().includes(term)
      );
    }
    
    this.filteredTypes = filtered;
  }

  onCategoryChange() {
    this.filterTypes();
  }

  onSearchChange() {
    this.filterTypes();
  }

  getEmptyType(): DocumentType {
    return { 
      code: '', 
      name: '', 
      description: '', 
      isMandatory: false, 
      hasExpiry: false, 
      defaultReminderDays: 30,
      sortOrder: 0,
      active: true 
    };
  }

  getEmptyCategory(): DocumentCategory {
    return { 
      code: '', 
      name: '', 
      description: '', 
      sortOrder: 0,
      active: true 
    };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmptyType();
    this.showModal = true;
  }

  openEditModal(item: DocumentType) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.isEditMode && this.editing.id) {
      this.documentService.updateType(this.editing.id, this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.documentService.createType(this.editing).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  delete(item: DocumentType) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.documentService.deleteType(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  openCategoryModal() {
    this.isEditCategoryMode = false;
    this.editingCategory = this.getEmptyCategory();
    this.showCategoryModal = true;
  }

  openEditCategoryModal(item: DocumentCategory) {
    this.isEditCategoryMode = true;
    this.editingCategory = { ...item };
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
  }

  saveCategory() {
    if (this.isEditCategoryMode && this.editingCategory.id) {
      this.documentService.updateCategory(this.editingCategory.id, this.editingCategory).subscribe({
        next: () => { this.loadData(); this.closeCategoryModal(); },
        error: (err) => console.error('Error updating category:', err)
      });
    } else {
      this.documentService.createCategory(this.editingCategory).subscribe({
        next: () => { this.loadData(); this.closeCategoryModal(); },
        error: (err) => console.error('Error creating category:', err)
      });
    }
  }

  deleteCategory(item: DocumentCategory) {
    if (item.id && confirm(`Are you sure you want to delete category "${item.name}"? This may affect document types.`)) {
      this.documentService.deleteCategory(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting category:', err)
      });
    }
  }

  initDefaultCategories() {
    this.documentService.initCategories().subscribe({
      next: () => { 
        alert('Default categories initialized successfully!');
        this.loadData(); 
      },
      error: (err) => console.error('Error initializing categories:', err)
    });
  }
}
