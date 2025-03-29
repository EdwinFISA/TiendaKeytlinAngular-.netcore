import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api`;

  private rolesSubject = new BehaviorSubject<any[]>([]);
  private estadosSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) { }

  // Cargar los roles y estados
  cargarRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      map(roles => roles.map(rol => {
        if (rol.id && !rol.Id) rol.Id = rol.id;
        if (rol.nombre && !rol.Nombre) rol.Nombre = rol.nombre;
        return rol;
      })),
      tap(roles => {
        console.log('Roles cargados:', roles);
        this.rolesSubject.next(roles);
      }),
      catchError(error => {
        console.error('Error al cargar roles:', error);
        return throwError(() => error);
      })
    );
  }

  cargarEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estados`).pipe(
      map(estados => estados.map(estado => {
        if (estado.id && !estado.Id) estado.Id = estado.id;
        if (estado.nombre && !estado.Nombre) estado.Nombre = estado.nombre;
        return estado;
      })),
      tap(estados => {
        console.log('Estados cargados:', estados);
        this.estadosSubject.next(estados);
      }),
      catchError(error => {
        console.error('Error al cargar estados:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener usuarios
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario`).pipe(
      map(usuarios => usuarios.map(usuario => ({
        ...usuario,
        // Normalizar propiedades
        Id: usuario.id || usuario.Id,
        EstadoId: usuario.estadoId || usuario.EstadoId,
        RolId: usuario.rolId || usuario.RolId,
        // Mantener nombres originales para la tabla
        estadoNombre: usuario.estado?.nombre || usuario.Estado?.Nombre,
        rolNombre: usuario.rol?.nombre || usuario.Rol?.Nombre
      }))),
      catchError(this.handleError)
    );
  }

  // Método auxiliar para normalizar propiedades
  private normalizarPropiedades(items: any[]): any[] {
    return items.map(item => {
      const normalizado = { ...item };

      // Normalizar propiedades del usuario
      if (item.id && !item.Id) normalizado.Id = item.id;
      if (item.nombre && !item.Nombre) normalizado.Nombre = item.nombre;
      if (item.apellido && !item.Apellido) normalizado.Apellido = item.apellido;
      if (item.correo && !item.Correo) normalizado.Correo = item.correo;
      if (item.telefono && !item.Telefono) normalizado.Telefono = item.telefono;
      if (item.rolId && !item.RolId) normalizado.RolId = item.rolId;
      if (item.estadoId && !item.EstadoId) normalizado.EstadoId = item.estadoId;



      return normalizado;
    });
  }

  // Asegúrate que los métodos obtengan los datos correctamente
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      tap(roles => console.log('Datos de roles recibidos:', roles)),
      catchError(this.handleError)
    );
  }

  obtenerEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estados`).pipe(
      tap(estados => console.log('Datos de estados recibidos:', estados)),
      catchError(this.handleError)
    );
  }

  // Obtener valores actuales de roles
  getRolesValue(): any[] {
    // Si no hay roles cargados, iniciar la carga
    if (this.rolesSubject.getValue().length === 0) {
      this.cargarRoles().subscribe();
    }
    return this.rolesSubject.getValue();
  }

  // Obtener valores actuales de estados
  getEstadosValue(): any[] {
    // Si no hay estados cargados, iniciar la carga
    if (this.estadosSubject.getValue().length === 0) {
      this.cargarEstados().subscribe();
    }
    return this.estadosSubject.getValue();
  }

  // Guardar usuario
  guardarUsuario(usuario: any): Observable<any> {
    const usuarioParaEnviar = { ...usuario };
    const roles = this.getRolesValue();
    const estados = this.getEstadosValue();

    if (!usuario.Id) {
      const contrasenaGenerada = this.generarContrasena();
      usuarioParaEnviar.Contrasena = contrasenaGenerada;

      // Busca el estado y rol por ID normalizando la propiedad
      usuarioParaEnviar.Estado = estados.find(e =>
        (e.Id === usuario.EstadoId) || (e.id === usuario.EstadoId)
      );
      usuarioParaEnviar.Rol = roles.find(r =>
        (r.Id === usuario.RolId) || (r.id === usuario.RolId)
      );

      console.log('Nuevo usuario a guardar:', usuarioParaEnviar);

      return this.http.post<any>(`${this.apiUrl}/usuario`, usuarioParaEnviar).pipe(
        tap(response => {
          console.log('Respuesta del servidor:', response);
          response.contrasenaGenerada = contrasenaGenerada;
        }),
        catchError(this.handleError)
      );
    } else {
      // Busca el estado y rol por ID normalizando la propiedad
      usuarioParaEnviar.Estado = estados.find(e =>
        (e.Id === usuario.EstadoId) || (e.id === usuario.EstadoId)
      );
      usuarioParaEnviar.Rol = roles.find(r =>
        (r.Id === usuario.RolId) || (r.id === usuario.RolId)
      );

      console.log('Usuario a actualizar:', usuarioParaEnviar);

      return this.http.put<any>(`${this.apiUrl}/usuario/${usuario.Id}`, usuarioParaEnviar).pipe(
        tap(response => console.log('Usuario actualizado:', response)),
        catchError(this.handleError)
      );
    }
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuario/${id}`).pipe(
      tap(response => console.log('Usuario eliminado:', response)),
      catchError(this.handleError)
    );
  }

  // Generar contraseña
  private generarContrasena(): string {
    const longitud = 10;
    const numeros = '0123456789';
    const letrasMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
    const caracteresEspeciales = '!@#$%^&*';

    let contrasena = '';

    contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
    contrasena += letrasMayusculas.charAt(Math.floor(Math.random() * letrasMayusculas.length));
    contrasena += letrasMinusculas.charAt(Math.floor(Math.random() * letrasMinusculas.length));
    contrasena += caracteresEspeciales.charAt(Math.floor(Math.random() * caracteresEspeciales.length));

    const caracteresTotales = numeros + letrasMayusculas + letrasMinusculas + caracteresEspeciales;
    while (contrasena.length < longitud) {
      contrasena += caracteresTotales.charAt(Math.floor(Math.random() * caracteresTotales.length));
    }

    return contrasena.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Manejo de errores
  private handleError(error: any) {
    console.error('Error detallado:', error);

    let mensajeError = 'Ha ocurrido un error';
    if (error?.status === 404) {
      mensajeError = 'No se encontró el recurso solicitado';
    } else if (error?.status === 500) {
      mensajeError = 'Error en el servidor, inténtalo más tarde';
    } else if (error.error?.errors) {
      const errores = error.error.errors;
      mensajeError = Object.keys(errores)
        .map(key => `${key}: ${errores[key].join(', ')}`)
        .join('\n');
    } else if (error.error?.message) {
      mensajeError = error.error.message;
    } else if (error.message) {
      mensajeError = error.message;
    }

    return throwError(() => mensajeError);
  }
}
