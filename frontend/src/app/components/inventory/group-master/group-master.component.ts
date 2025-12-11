import { Component, OnInit } from '@angular/core';
import { ItemGroupService, ItemGroup } from '../../../services/item-group.service';

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

  constructor(private groupService: ItemGroupService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading groups', err);
        this.loading = false;
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
    if (group) {
      this.editMode = true;
      this.selectedGroup = { ...group };
    } else {
      this.editMode = false;
      this.selectedGroup = this.getEmptyGroup();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedGroup = this.getEmptyGroup();
  }

  saveGroup(): void {
    if (this.editMode && this.selectedGroup.id) {
      this.groupService.update(this.selectedGroup.id, this.selectedGroup).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('Error updating group', err)
      });
    } else {
      this.groupService.create(this.selectedGroup).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('Error creating group', err)
      });
    }
  }

  deleteGroup(id: number): void {
    if (confirm('Are you sure you want to delete this group?')) {
      this.groupService.delete(id).subscribe({
        next: () => this.loadGroups(),
        error: (err) => console.error('Error deleting group', err)
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-danger';
  }
}
