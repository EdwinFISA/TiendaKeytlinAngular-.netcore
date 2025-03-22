import { Component } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})

export class UsuariosComponent {
  filtroUsuario = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  paginaActual = 1;
  registrosPorPagina = 10;

  usuarios = [
    {
      id: 1,
      username: 'efigueroa12',
      nombres: 'Edwin',
      apellidos: 'Figueroa',
      rol: 'Admin',
      estado: 'Activo',
      fechaCreacion: '12/03/2025',
      foto: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    // Aquí puedes agregar más usuarios
  ];

  // Filtrar usuarios por nombre
  buscarUsuario() {
    if (this.filtroUsuario.trim() === '') return;
    this.usuarios = this.usuarios.filter((usuario) =>
      usuario.username.includes(this.filtroUsuario)
    );
  }

  // Filtrar por fecha (Lógica a implementar según tu backend)
  filtrarPorFecha() {
    console.log(`Filtrando usuarios entre ${this.fechaInicio} y ${this.fechaFin}`);
  }

  // Lógica de paginación
  usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.usuarios.slice(inicio, inicio + this.registrosPorPagina);
  }

  totalPaginas() {
    return Math.ceil(this.usuarios.length / this.registrosPorPagina);
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

  // Acciones de usuario
  verUsuario(usuario: any) {
    alert(`Ver usuario: ${usuario.username}`);
  }

  editarUsuario(usuario: any) {
    alert(`Editar usuario: ${usuario.username}`);
  }

  eliminarUsuario(id: number) {
    this.usuarios = this.usuarios.filter((u) => u.id !== id);
  }

  crearUsuario() {
    alert('Función para crear un nuevo usuario');
  }
}
