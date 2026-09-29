import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Livro } from './livro.model';

@Injectable({ providedIn: 'root' })
export class LivroService {
  private http = inject(HttpClient);
  // Para usar outra API, troque apenas esta URL
  private readonly url = 'http://localhost:3000/livros';

  listar(): Observable<Livro[]> {            // GET ALL
    return this.http.get<Livro[]>(this.url);
  }
  criar(livro: Livro): Observable<Livro> {   // POST
    return this.http.post<Livro>(this.url, livro);
  }
  atualizar(id: number, livro: Livro): Observable<Livro> { // PUT
    return this.http.put<Livro>(`${this.url}/${id}`, livro);
  }
  excluir(id: number): Observable<void> {    // DELETE
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
