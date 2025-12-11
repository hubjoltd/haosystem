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
  baseUnits: UnitOfMeasure[] = [];
  showModal: boolean = false;
  editMode: boolean = false;
  selectedUnit: UnitOfMeasure = this.getEmptyUnit();
  selectedBaseUomId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';

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

    this.unitService.getBaseUnits().subscribe({
      next: (data) => this.baseUnits = data,
      error: (err) => console.error('Error loading base units', err)
    });
  }

  getEmptyUnit(): UnitOfMeasure {
    return {
      code: '',
      name: '',
      symbol: '',
      conversionFactor: 1,
      status: 'Active'
    };
  }

  openModal(unit?: UnitOfMeasure) {
    this.errorMessage = '';
    if (unit) {
      this.editMode = true;
      this.selectedUnit = { ...unit };
      this.selectedBaseUomId = unit.baseUom?.id || null;
    } else {
      this.editMode = false;
      this.selectedUnit = this.getEmptyUnit();
      this.selectedBaseUomId = null;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUnit = this.getEmptyUnit();
    this.selectedBaseUomId = null;
    this.errorMessage = '';
  }

  isFormValid(): boolean {
    return this.selectedUnit.code.trim() !== '' && 
           this.selectedUnit.name.trim() !== '';
  }

  isBaseUnit(): boolean {
    return this.selectedBaseUomId === null;
  }

  saveUnit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'UOM Code and Name are required';
      return;
    }

    const unitToSave: UnitOfMeasure = {
      ...this.selectedUnit,
      baseUom: this.selectedBaseUomId ? this.baseUnits.find(u => u.id === this.selectedBaseUomId) : undefined
    };

    if (this.editMode && this.selectedUnit.id) {
      this.unitService.update(this.selectedUnit.id, unitToSave).subscribe({
        next: () => {
          this.loadUnits();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error updating unit';
        }
      });
    } else {
      this.unitService.create(unitToSave).subscribe({
        next: () => {
          this.loadUnits();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error creating unit';
        }
      });
    }
  }

  deleteUnit(id: number): void {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.unitService.delete(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => {
          alert(err.error?.error || 'Error deleting unit');
        }
      });
    }
  }

  getUnitType(unit: UnitOfMeasure): string {
    return unit.baseUom ? 'Alternate' : 'Base';
  }
}
