import { Observable, Subject, finalize } from 'rxjs';

export interface WithLoadingState {
  loading: boolean;
  dataReady: boolean;
}

export class LoadingCoordinator {
  private expectedCalls = 0;
  private completedCalls = 0;
  private _loading = true;
  private _dataReady = false;
  private readySubject = new Subject<void>();

  get loading(): boolean {
    return this._loading;
  }

  get dataReady(): boolean {
    return this._dataReady;
  }

  whenReady$ = this.readySubject.asObservable();

  begin(expectedCalls: number): void {
    this.expectedCalls = expectedCalls;
    this.completedCalls = 0;
    this._loading = true;
    this._dataReady = false;
  }

  reset(): void {
    this.expectedCalls = 0;
    this.completedCalls = 0;
    this._loading = true;
    this._dataReady = false;
  }

  increment(): void {
    this.completedCalls++;
    this.checkComplete();
  }

  private checkComplete(): void {
    if (this.completedCalls >= this.expectedCalls) {
      this._loading = false;
      this._dataReady = true;
      this.readySubject.next();
    }
  }

  observe<T>(
    observable: Observable<T>,
    onSuccess?: (data: T) => void,
    onError?: (err: any) => void
  ): void {
    observable.pipe(
      finalize(() => this.increment())
    ).subscribe({
      next: (data) => {
        if (onSuccess) onSuccess(data);
      },
      error: (err) => {
        console.error('LoadingCoordinator error:', err);
        if (onError) onError(err);
      }
    });
  }

  completeNow(): void {
    this._loading = false;
    this._dataReady = true;
    this.readySubject.next();
  }
}
