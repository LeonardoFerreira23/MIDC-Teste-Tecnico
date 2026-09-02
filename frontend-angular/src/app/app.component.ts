import { RecordService } from './record.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


type Feedback = { kind: 'success' | 'error'; message: string } | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './app.component.css',
  template: `
    <main class="page">
      <header class="header">
        <h1>Cadastro de indicadores</h1>
        <p>Registre as entregas de um funcionário em uma data de referência.</p>
      </header>

      <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="name">Nome do funcionário</label>
          <input id="name" type="text" formControlName="name" autocomplete="off" />
          <p class="error" *ngIf="showError('name')">Informe o nome (mínimo 2 caracteres).</p>
        </div>

        <div class="field">
          <label for="department">Departamento</label>
          <input id="department" type="text" formControlName="department" autocomplete="off" />
          <p class="error" *ngIf="showError('department')">Informe o departamento.</p>
        </div>

        <div class="row">
          <div class="field">
            <label for="reference_date">Data de referência</label>
            <input id="reference_date" type="date" formControlName="reference_date" />
            <p class="error" *ngIf="showError('reference_date')">Selecione a data.</p>
          </div>

          <div class="field">
            <label for="deliveries">Quantidade de entregas</label>
            <input id="deliveries" type="number" min="0" step="1" formControlName="deliveries" />
            <p class="error" *ngIf="showError('deliveries')">
              Informe um número igual ou maior que zero.
            </p>
          </div>
        </div>

        <div class="field">
          <label for="note">Observação (opcional)</label>
          <textarea id="note" rows="3" formControlName="note"></textarea>
        </div>

        <button type="submit" [disabled]="saving">
          {{ saving ? 'Salvando…' : 'Salvar registro' }}
        </button>

        <p class="feedback" *ngIf="feedback"
           [class.ok]="feedback.kind === 'success'"
           [class.fail]="feedback.kind === 'error'">
          {{ feedback.message }}
        </p>
      </form>
    </main>
  `,
})
export class AppComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RecordService);

  saving = false;
  feedback: Feedback = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    department: ['', [Validators.required, Validators.minLength(2)]],
    reference_date: ['', Validators.required],
    deliveries: [0, [Validators.required, Validators.min(0)]],
    note: [''],
  });

  /** Só mostra erro depois que o usuário mexeu no campo ou tentou enviar. */
  showError(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.touched || field.dirty);
  }

  submit(): void {
    this.feedback = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback = { kind: 'error', message: 'Revise os campos destacados.' };
      return;
    }

    const value = this.form.getRawValue();
    this.saving = true;

    this.service
      .create({
        name: value.name.trim(),
        department: value.department.trim(),
        // O input type="date" já entrega "YYYY-MM-DD", que é o que a API espera.
        reference_date: value.reference_date,
        deliveries: Number(value.deliveries),
        note: value.note.trim() || null,
      })
      .subscribe({
        next: (record) => {
          this.saving = false;
          this.feedback = {
            kind: 'success',
            message: `Registro de ${record.employee.name} salvo com sucesso.`,
          };
          this.form.reset({
            name: '', department: '', reference_date: '', deliveries: 0, note: '',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          this.feedback = { kind: 'error', message: this.describe(err) };
        },
      });
  }

  /** Mostra o detail que a API devolveu em vez de um texto genérico. */
  private describe(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Não foi possível falar com a API. Verifique se o backend está no ar.';
    }
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return `Dados inválidos: ${detail[0].msg}`;
    }
    return `Erro ao salvar (HTTP ${err.status}).`;
  }
}