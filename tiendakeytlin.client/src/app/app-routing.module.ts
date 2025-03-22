import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsuariosComponent } from '../app/Menu/Administracion/Usuarios/usuarios/usuarios.component';
import { ContactoComponent } from '../app/Menu/Administracion/Contacto/contacto/contacto.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'home', component: SidebarComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'administracion/usuarios', component: UsuariosComponent },
      { path: 'administracion/contacto', component: ContactoComponent },
      // Otras rutas aquí
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

