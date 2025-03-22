import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-usuarios-modal',
  standalone: false,
  templateUrl: './usuarios-modal.component.html',
  styleUrl: './usuarios-modal.component.css'
})

export class UsuarioModalComponent {
  @Input() usuario: any = {}; // Datos del usuario
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

  onSubmit() {
    this.guardar.emit(this.usuario);
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
