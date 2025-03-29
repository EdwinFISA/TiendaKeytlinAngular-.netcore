import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css'],
  standalone: false
})
export class UsuarioModalComponent implements OnInit {
  @Input() usuario: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
  @ViewChild('usuarioForm') usuarioForm!: NgForm;
  roles: any[] = [];
  estados: any[] = [];
  constructor(private usuarioService: UsuarioService) {
    console.log('Constructor del modal');
  }
  ngOnInit(): void {
    console.log('ngOnInit del modal - Usuario:', this.usuario);
    this.cargarDatos();
  }
  cargarDatos(): void {
    this.usuarioService.obtenerRoles().subscribe(roles => {
      console.log('Roles recibidos en modal:', roles);
      this.roles = roles;
      if (!this.usuario.Id && roles.length > 0) {
        const rolVendedor = roles.find(r => r.Nombre?.toLowerCase() === 'vendedor');
        if (rolVendedor) {
          this.usuario.RolId = rolVendedor.Id;
          console.log('Rol por defecto establecido:', rolVendedor);
        }
      }
    });
    this.usuarioService.obtenerEstados().subscribe(estados => {
      console.log('Estados recibidos en modal:', estados);
      this.estados = estados;
      if (!this.usuario.Id && estados.length > 0) {
        const estadoActivo = estados.find(e => e.Nombre?.toLowerCase() === 'activo');
        if (estadoActivo) {
          this.usuario.EstadoId = estadoActivo.Id;
          console.log('Estado por defecto establecido:', estadoActivo);
        }
      }
    });
  }
  onSubmit(): void {
    console.log('Formulario enviado - Usuario:', this.usuario);
    console.log('Roles disponibles:', this.roles);
    console.log('Estados disponibles:', this.estados);
    if (this.usuarioForm.form.valid && this.validarFormulario()) {
      const usuarioAGuardar = { ...this.usuario };
      usuarioAGuardar.Estado = this.estados.find(e => e.Id === this.usuario.EstadoId);
      usuarioAGuardar.Rol = this.roles.find(r => r.Id === this.usuario.RolId);
      console.log('Usuario a guardar:', usuarioAGuardar);
      this.guardar.emit(usuarioAGuardar);
    }
  }
  validarFormulario(): boolean {
    if (!this.usuario.Nombre?.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!this.usuario.Apellido?.trim()) {
      alert('El apellido es requerido');
      return false;
    }
    if (!this.usuario.Correo?.trim()) {
      alert('El correo es requerido');
      return false;
    }
    if (!this.validarCorreo(this.usuario.Correo)) {
      alert('El correo no tiene un formato válido');
      return false;
    }
    if (!this.usuario.Telefono?.trim()) {
      alert('El teléfono es requerido');
      return false;
    }
    if (!this.usuario.EstadoId) {
      alert('El estado es requerido');
      return false;
    }
    if (!this.usuario.RolId) {
      alert('El rol es requerido');
      return false;
    }
    return true;
  }
  private validarCorreo(correo: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(correo);
  }
  cerrarModal(): void {
    this.cerrar.emit();
  }
}
