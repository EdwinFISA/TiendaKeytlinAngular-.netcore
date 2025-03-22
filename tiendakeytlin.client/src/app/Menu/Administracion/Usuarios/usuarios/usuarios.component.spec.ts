import { Component } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  filtroUsuario: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  usuarios: any[] = []; // Lista de usuarios obtenida del backend
  usuarioSeleccionado: any = null;
  mostrarModal: boolean = false;
  paginaActual: number = 1;
  usuariosPorPagina: number = 10;

  constructor() { }

  buscarUsuario() {
    console.log('Buscando usuario con filtro:', this.filtroUsuario);
    // Lógica para filtrar usuarios
  }

  filtrarPorFecha() {
    console.log('Filtrando usuarios entre:', this.fechaInicio, 'y', this.fechaFin);
    // Lógica para filtrar usuarios por fecha
  }

  usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    return this.usuarios.slice(inicio, inicio + this.usuariosPorPagina);
  }

  verUsuario(usuario: any) {
    console.log('Ver usuario:', usuario);
    this.usuarioSeleccionado = usuario;
    this.mostrarModal = true;
  }

  abrirModalCrear() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModal = true;
  }

  eliminarUsuario(id: number) {
    console.log('Eliminando usuario con ID:', id);
    this.usuarios = this.usuarios.filter(user => user.id !== id);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  totalPaginas() {
    return Math.ceil(this.usuarios.length / this.usuariosPorPagina);
  }

  guardarUsuario(usuario: any) {
    console.log('Guardando usuario:', usuario);
    if (usuario.id) {
      // Editar usuario existente
      const index = this.usuarios.findIndex(u => u.id === usuario.id);
      if (index !== -1) {
        this.usuarios[index] = usuario;
      }
    } else {
      // Crear nuevo usuario
      usuario.id = this.usuarios.length + 1; // Asignar un ID temporal
      this.usuarios.push(usuario);
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}

