import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { JwtInterceptor } from './interceptors/jwt.interceptors';
import { JwtModule } from '@auth0/angular-jwt';
import { ContactoComponent } from './Menu/Administracion/Contacto/contacto/contacto.component';
import { ContactoModalComponent } from './Menu/Administracion/Contacto/contacto-modal/contacto-modal.component';
import { UsuariosComponent } from './Menu/Administracion/Usuarios/usuarios/usuarios.component';
import { UsuarioModalComponent } from './Menu/Administracion/Usuarios/usuarios-modal/usuarios-modal.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ContactoComponent,
    ContactoModalComponent,
    UsuariosComponent,
    UsuarioModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    LoginComponent, // Importa LoginComponent como standalone
    DashboardComponent, // Importa DashboardComponent como standalone
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5010'],
        disallowedRoutes: ['http://localhost:5010/api/auth/login']
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
