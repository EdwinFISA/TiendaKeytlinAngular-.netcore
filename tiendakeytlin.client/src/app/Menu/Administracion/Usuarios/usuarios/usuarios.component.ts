import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: false
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModal = false;
  usuarioSeleccionado: any = null;
  roles: any[] = [];
  estados: any[] = [];

  rolesCargados = false;
  estadosCargados = false;

  // Filtros
  filtroUsuario = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  constructor(private usuarioService: UsuarioService) { }

  originalUsuarios: any[] = [];

  ngOnInit(): void {
    this.cargarRolesYEstados();
    this.cargarUsuarios();
    this.verificarPropiedadesUsuarios();
  }

  // Modifica cargarRolesYEstados()
  cargarRolesYEstados() {
    this.usuarioService.obtenerRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.rolesCargados = true;
        console.log('Roles cargados:', roles);
        this.verificarPropiedades(roles, 'Rol');

        if (this.rolesCargados && this.estadosCargados) {
          this.actualizarNombresUsuarios();
        }
      },
      error: (error) => console.error('Error al cargar roles:', error)
    });

    this.usuarioService.obtenerEstados().subscribe({
      next: (estados) => {
        this.estados = estados;
        this.estadosCargados = true;
        console.log('Estados cargados:', estados);
        this.verificarPropiedades(estados, 'Estado');

        if (this.rolesCargados && this.estadosCargados) {
          this.actualizarNombresUsuarios();
        }
      },
      error: (error) => console.error('Error al cargar estados:', error)
    });
  }

  // Nuevo método para debuggear propiedades
  verificarPropiedades(items: any[], tipo: string) {
    if (items.length > 0) {
      console.log(`Estructura de ${tipo}:`, Object.keys(items[0]));
      console.log(`Primer ${tipo}:`, items[0]);
    }
  }


  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        console.log('Datos de usuarios recibidos:', data);
        this.originalUsuarios = data;
        this.usuarios = [...data];

        this.verificarPropiedadesUsuarios();

        // Solo actualiza si ya cargaron roles y estados
        if (this.rolesCargados && this.estadosCargados) {
          this.actualizarNombresUsuarios();
        } else {
          console.warn("Roles y estados aún no están cargados. Se actualizarán después.");
        }
      },
      error: (error) => console.error(error)
    });
  }

  verificarPropiedadesUsuarios() {
    if (this.usuarios.length > 0) {
      console.log('Estructura de Usuarios:', Object.keys(this.usuarios[0]));
      console.log('Primer Usuario:', this.usuarios[0]);
    }
  }

  buscarUsuario() {
    if (!this.filtroUsuario.trim()) {
      this.usuarios = [...this.originalUsuarios];
      return;
    }

    const filtro = this.filtroUsuario.toLowerCase();
    this.usuarios = this.originalUsuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(filtro) ||
      usuario.apellido.toLowerCase().includes(filtro) ||
      usuario.correo.toLowerCase().includes(filtro)
    );
  }

  filtrarPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor seleccione ambas fechas');
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      alert('Por favor ingrese fechas válidas');
      return;
    }

    this.usuarios = this.originalUsuarios.filter(usuario => {
      const fechaCreacion = new Date(usuario.fechaCreacion);
      return fechaCreacion >= inicio && fechaCreacion <= fin;
    });
  }

  usuariosPaginados(): any[] {
    return this.usuarios.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.usuarios.length / this.elementosPorPagina);
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

  abrirModalCrear() {
    this.usuarioSeleccionado = {
      Id: 0,
      Nombre: '',
      Apellido: '',
      Correo: '',
      Telefono: '',
      Imagen: '',
      EstadoId: null,
      RolId: null,
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: any) {
    // Normalizar propiedades
    const usuarioNormalizado = {
      ...usuario,
      Id: usuario.id || usuario.Id,
      EstadoId: usuario.estadoId || usuario.EstadoId,
      RolId: usuario.rolId || usuario.RolId
    };

    this.usuarioSeleccionado = {
      ...usuarioNormalizado,
      // Buscar objetos completos de rol y estado para el modal
      Rol: this.roles.find(r => r.Id === usuarioNormalizado.RolId || r.id === usuarioNormalizado.RolId),
      Estado: this.estados.find(e => e.Id === usuarioNormalizado.EstadoId || e.id === usuarioNormalizado.EstadoId)
    };

    console.log('Usuario para editar:', this.usuarioSeleccionado);
    this.mostrarModal = true;
  }

  verUsuario(usuario: any) {
    console.log('Ver usuario:', usuario);
  }

  obtenerNombreRol(rolId: number): string {
    if (!this.roles || this.roles.length === 0) return 'Cargando...';

    const rolEncontrado = this.roles.find(r =>
      r.id === rolId || r.Id === rolId // Asegúrate de que el identificador sea correcto
    );

    return rolEncontrado?.nombre || rolEncontrado?.Nombre || 'Desconocido';
  }

  obtenerNombreEstado(estadoId: number): string {
    if (!this.estados || this.estados.length === 0) return 'Cargando...';

    const estadoEncontrado = this.estados.find(e =>
      e.id === estadoId || e.Id === estadoId // Asegúrate de que el identificador sea correcto
    );

    return estadoEncontrado?.nombre || estadoEncontrado?.Nombre || 'Desconocido';
  }

  actualizarNombresUsuarios() {
    console.log('Usuarios antes de actualizar:', this.usuarios);
    console.log('Roles disponibles:', this.roles);
    console.log('Estados disponibles:', this.estados);

    this.usuarios.forEach(usuario => {
      console.log(`Verificando usuario: ${usuario.nombre || usuario.Nombre}, rolId: ${usuario.rolId || usuario.RolId}, estadoId: ${usuario.estadoId || usuario.EstadoId}`);

      // Normalizar los IDs antes de buscar en los arrays
      const rolId = usuario.rolId || usuario.RolId;
      const estadoId = usuario.estadoId || usuario.EstadoId;

      const rolEncontrado = this.roles.find(rol => rol.id === rolId || rol.Id === rolId);
      const estadoEncontrado = this.estados.find(estado => estado.id === estadoId || estado.Id === estadoId);

      console.log(`Rol encontrado para ${usuario.nombre || usuario.Nombre}:`, rolEncontrado);
      console.log(`Estado encontrado para ${usuario.nombre || usuario.Nombre}:`, estadoEncontrado);

      usuario.rolNombre = rolEncontrado ? rolEncontrado.nombre || rolEncontrado.Nombre : 'Desconocido';
      usuario.estadoNombre = estadoEncontrado ? estadoEncontrado.nombre || estadoEncontrado.Nombre : 'Desconocido';
    });

    console.log('Usuarios después de actualizar:', this.usuarios);
  }

  guardarUsuario(usuario: any) {
    // Preparar datos para enviar (manteniendo tu estructura actual)
    const usuarioParaGuardar = {
      ...usuario,
      Id: this.usuarioSeleccionado.Id || 0,
      RolId: this.usuarioSeleccionado.RolId,
      EstadoId: this.usuarioSeleccionado.EstadoId,
      // Mantener los campos existentes
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono
    };

    // Solo para DEBUG - Verificar datos antes de enviar
    console.log('Datos preparados para enviar:', JSON.stringify(usuarioParaGuardar, null, 2));

    this.usuarioService.guardarUsuario(usuarioParaGuardar).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.cargarUsuarios();
        this.cerrarModal();

        if (!usuarioParaGuardar.Id) {
          alert(`Usuario creado. Contraseña: ${response.contrasenaGenerada}`);
        } else {
          alert('Usuario actualizado correctamente');
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        // Manejo mejorado de errores
        let mensajeError = 'Error al guardar usuario';
        if (error.error?.errors) {
          mensajeError = Object.entries(error.error.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        }
        alert(mensajeError);
      }
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
          this.cargarUsuarios();
          alert('Usuario eliminado con éxito');
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert(error);
        }
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }
}
