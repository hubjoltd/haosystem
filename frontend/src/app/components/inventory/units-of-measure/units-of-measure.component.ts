import { Component, OnInit } from '@angular/core';
import { UnitOfMeasureService, UnitOfMeasure } from '../../../services/unit-of-measure.service';

@Component({
  selector: 'app-units-of-measure',
  standalone: false,
  templateUrl: './units-of-measure.component.html',
  styleUrls: ['./units-of-measure.component.scss']
})
export class UnitsOfMeasureComponent implements OnInit {
  units: UnitOfMeasure[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedUnit: UnitOfMeasure = this.getEmptyUnit();
  loading: boolean = false;

  constructor(private unitService: UnitOfMeasureService) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading = true;
    this.unitService.getAll().subscribe({
      next: (data) => {
        this.units = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading units', err);
        this.loading = false;
      }
    });
  }

  getEmptyUnit(): UnitOfMeasure {
    return {
      code: '',
      name: '',
      symbol: '',
      status: 'Active'
    };
  }

  openModal(unit?: UnitOfMeasure) {
    if (unit) {
      this.editMode = true;
      this.selectedUnit = { ...unit };
    } else {
      this.editMode = false;
      this.selectedUnit = this.getEmptyUnit();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUnit = this.getEmptyUnit();
  }

  saveUnit(): void {
    if (this.editMode && this.selectedUnit.id) {
      this.unitService.update(this.selectedUnit.id, this.selectedUnit).subscribe({
        next: () => {
          this.loadUnits();
          this.closeModal();
        },
        error: (err) => console.error('Error updating unit', err)
      });
    } else {
      this.unitService.create(this.selectedUnit).subscribe({
        next: () => {
          this.loadUnits();
          this.closeModal();
        },
        error: (err) => console.error('Error creating unit', err)
      });
    }
  }

  deleteUnit(id: number): void {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.unitService.delete(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => console.error('Error deleting unit', err)
      });
    }
  }
}
