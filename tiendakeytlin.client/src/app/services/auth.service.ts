import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Definir interfaces directamente en el servicio
export interface LoginModel {
  email: string; // Cambiado a 'email' para coincidir con el backend
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string; // Cambiado a 'string' para manejar la fecha como cadena
  name: string;
  userId: number;
}

export interface User {
  id: number;
  email: string; // Cambiado a 'email' para coincidir con el backend
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login service
  login(loginData: LoginModel): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          // Guardar token y datos de usuario en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('tokenExpiration', response.expiration);

          const user: User = {
            id: response.userId,
            email: loginData.email, // Cambiado a 'email'
            name: response.name
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);

          // Configurar temporizador para cerrar sesión cuando expire el token
          this.autoLogout(new Date(response.expiration).getTime() - new Date().getTime());
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => new Error(error.error || 'Error al iniciar sesión'));
        })
      );
  }

  // Logout service
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('tokenExpiration');

    if (!token || !expirationDate) {
      return false;
    }

    return new Date(expirationDate) > new Date();
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener perfil del usuario
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo perfil:', error);
          return throwError(() => new Error('Error al obtener perfil de usuario'));
        })
      );
  }

  // Obtener usuario desde localStorage
  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Error al parsear datos de usuario:', e);
        return null;
      }
    }
    return null;
  }

  // Establecer auto-logout al expirarse el token
  private autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
