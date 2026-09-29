import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Livro } from './livro.model';
import { LivroService } from './livro.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main>
      <h1>📚 Biblioteca</h1>

      <form [formGroup]="form" (ngSubmit)="salvar()">
        <h2>{{ editandoId() ? 'Editar livro' : 'Novo livro' }}</h2>
        <input formControlName="titulo" placeholder="Título">
        <input formControlName="autor" placeholder="Autor">
        <input formControlName="ano" type="number" placeholder="Ano">
        <label><input type="checkbox" formControlName="lido"> Já li</label>
        <div class="acoes">
          <button type="submit" [disabled]="form.invalid">
            {{ editandoId() ? 'Atualizar' : 'Adicionar' }}
          </button>
          @if (editandoId()) {
            <button type="button" class="sec" (click)="cancelar()">Cancelar</button>
          }
        </div>
      </form>

      @if (erro()) { <p class="erro">{{ erro() }}</p> }

      <ul>
        @for (l of livros(); track l.id) {
          <li>
            <div>
              <strong>{{ l.titulo }}</strong>
              <small>{{ l.autor }} · {{ l.ano }} · {{ l.lido ? '✅ lido' : '📖 não lido' }}</small>
            </div>
            <div class="acoes">
              <button class="sec" (click)="editar(l)">Editar</button>
              <button class="perigo" (click)="excluir(l)">Excluir</button>
            </div>
          </li>
        } @empty {
          <li>Nenhum livro cadastrado.</li>
        }
      </ul>
    </main>
  `,
  styles: [`
    main { max-width: 640px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; }
    form { display: grid; gap: .6rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1.5rem; }
    input:not([type=checkbox]) { padding: .5rem; border: 1px solid #ccc; border-radius: 6px; }
    ul { list-style: none; padding: 0; display: grid; gap: .6rem; }
    li { display: flex; justify-content: space-between; align-items: center; padding: .8rem 1rem; border: 1px solid #ddd; border-radius: 8px; }
    li small { display: block; color: #666; }
    .acoes { display: flex; gap: .4rem; }
    button { padding: .45rem .9rem; border: 0; border-radius: 6px; background: #2563eb; color: #fff; cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .sec { background: #6b7280; } .perigo { background: #dc2626; }
    .erro { color: #dc2626; }
  `]
})
export class AppComponent implements OnInit {
  private service = inject(LivroService);
  private fb = inject(FormBuilder);

  livros = signal<Livro[]>([]);
  editandoId = signal<number | null>(null);
  erro = signal('');

  form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    autor: ['', Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1)]],
    lido: [false]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.service.listar().subscribe({
      next: dados => this.livros.set(dados),
      error: () => this.erro.set('Não foi possível conectar à API (rode "npm run api").')
    });
  }

  salvar() {
    const livro = this.form.getRawValue();
    const id = this.editandoId();
    const req = id ? this.service.atualizar(id, livro) : this.service.criar(livro);
    req.subscribe({
      next: () => { this.cancelar(); this.carregar(); },
      error: () => this.erro.set('Erro ao salvar o livro.')
    });
  }

  editar(l: Livro) {
    this.editandoId.set(l.id!);
    this.form.setValue({ titulo: l.titulo, autor: l.autor, ano: l.ano, lido: l.lido });
  }

  cancelar() {
    this.editandoId.set(null);
    this.erro.set('');
    this.form.reset({ titulo: '', autor: '', ano: new Date().getFullYear(), lido: false });
  }

  excluir(l: Livro) {
    if (!confirm(`Excluir "${l.titulo}"?`)) return;
    this.service.excluir(l.id!).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Erro ao excluir o livro.')
    });
  }
}
