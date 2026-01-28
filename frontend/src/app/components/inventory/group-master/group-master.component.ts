import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';
import { SettingsService } from '../../../services/settings.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-group-master',
  standalone: false,
  templateUrl: './group-master.component.html',
  styleUrls: ['./group-master.component.scss']
})
export class GroupMasterComponent implements OnInit {
  groups: ItemGroup[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  editMode: boolean = false;
  selectedGroup: ItemGroup = this.getEmptyGroup();
  loading: boolean = false;
  errorMessage: string = '';
  canDeactivateInfo: { canDeactivate: boolean; itemCount: number } | null = null;

  constructor(
    private groupService: ItemGroupService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading groups', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredGroups() {
    if (!this.searchQuery) return this.groups;
    return this.groups.filter(g => 
      g.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getEmptyGroup(): ItemGroup {
    return {
      code: '',
      name: '',
      description: '',
      status: 'Active'
    };
  }

  openModal(group?: ItemGroup) {
    this.errorMessage = '';
    this.canDeactivateInfo = null;
    if (group) {
      this.editMode = true;
      this.selectedGroup = { ...group };
      this.checkCanDeactivate(group.id!);
    } else {
      this.editMode = false;
      this.selectedGroup = this.getEmptyGroup();
      this.generateGroupCode();
    }
    this.showModal = true;
  }

  generateGroupCode(): void {
    this.settingsService.previewPrefixId('group').subscribe({
      next: (code) => {
        this.selectedGroup.code = code;
      },
      error: (err) => console.error('Error generating group code', err)
    });
  }

  checkCanDeactivate(id: number): void {
    this.groupService.canDeactivate(id).subscribe({
      next: (info) => {
        this.canDeactivateInfo = info;
      },
      error: (err) => console.error('Error checking deactivate status', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedGroup = this.getEmptyGroup();
    this.errorMessage = '';
    this.canDeactivateInfo = null;
  }

  isFormValid(): boolean {
    return this.selectedGroup.code.trim() !== '' && 
           this.selectedGroup.name.trim() !== '';
  }

  canChangeToInactive(): boolean {
    if (!this.editMode) return true;
    if (this.selectedGroup.status === 'Active') return true;
    if (this.canDeactivateInfo === null) return true;
    return this.canDeactivateInfo.canDeactivate;
  }

  saveGroup(): void {
    if (!this.isFormValid()) {
      this.notificationService.error('Group Code and Name are required');
      return;
    }

    if (this.editMode && this.selectedGroup.status === 'Inactive' && 
        this.canDeactivateInfo && !this.canDeactivateInfo.canDeactivate) {
      this.notificationService.error(`Cannot deactivate: ${this.canDeactivateInfo.itemCount} item(s) are linked to this group`);
      return;
    }

    if (this.editMode && this.selectedGroup.id) {
      this.groupService.update(this.selectedGroup.id, this.selectedGroup).subscribe({
        next: () => {
          this.notificationService.success('Group updated successfully');
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error updating group');
        }
      });
    } else {
      this.groupService.create(this.selectedGroup).subscribe({
        next: () => {
          this.notificationService.success('Group created successfully');
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Error creating group');
        }
      });
    }
  }

  deleteGroup(id: number): void {
    this.groupService.canDeactivate(id).subscribe({
      next: (info) => {
        if (!info.canDeactivate) {
          this.notificationService.error(`Cannot delete group: ${info.itemCount} item(s) are linked to this group. Please reassign or delete those items first.`);
          return;
        }
        if (confirm('Are you sure you want to delete this group?')) {
          this.groupService.delete(id).subscribe({
            next: () => {
              this.notificationService.success('Group deleted successfully');
              this.loadGroups();
            },
            error: (err) => {
              this.notificationService.error(err.error?.error || 'Error deleting group');
            }
          });
        }
      },
      error: (err) => console.error('Error checking delete status', err)
    });
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }
}
