import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService, Location } from '../../../../services/organization.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-locations',
  standalone: false,
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationsComponent implements OnInit {
  locations: Location[] = [];
  
  loading = false;
  dataReady = false;
  saving = false;
  
  showModal = false;
  isEditMode = false;
  editing: Location = this.getEmpty();

  locationTypes = ['Headquarters', 'Branch', 'Warehouse', 'Office', 'Factory', 'Remote'];

  constructor(private orgService: OrganizationService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dataReady = false;
    this.orgService.getLocations().subscribe({
      next: (data) => { this.locations = data; this.completeLoading(); },
      error: (err) => { console.error('Error loading locations:', err); this.completeLoading(); }
    });
  }
  
  completeLoading() {
    this.loading = false;
    this.dataReady = true;
    this.cdr.detectChanges();
  }

  getEmpty(): Location {
    return { code: '', name: '', address: '', city: '', state: '', country: '', zipCode: '', phone: '', email: '', locationType: '', active: true };
  }

  openModal() {
    this.isEditMode = false;
    this.editing = this.getEmpty();
    this.showModal = true;
  }

  openEditModal(item: Location) {
    this.isEditMode = true;
    this.editing = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    
    if (this.isEditMode && this.editing.id) {
      this.orgService.updateLocation(this.editing.id, this.editing).subscribe({
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Location updated successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error updating:', err); 
          this.toastService.error('Failed to update location');
        }
      });
    } else {
      this.orgService.createLocation(this.editing).subscribe({
        next: () => { 
          this.saving = false; 
          this.cdr.detectChanges();
          this.toastService.success('Location created successfully!');
          this.loadData(); 
          this.closeModal(); 
        },
        error: (err) => { 
          this.saving = false; 
          this.cdr.detectChanges();
          console.error('Error creating:', err); 
          this.toastService.error('Failed to create location');
        }
      });
    }
  }

  delete(item: Location) {
    if (item.id && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.orgService.deleteLocation(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }
}
