using Microsoft.EntityFrameworkCore;
using TiendaKeytlin.Server.Models; 

namespace TiendaKeytlin.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<EstadoUsuario> Estados { get; set; }
        public DbSet<RolUsuario> Roles { get; set; }
        public DbSet<Empresa> Empresa { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Insertar datos iniciales para Estados
            modelBuilder.Entity<EstadoUsuario>().HasData(
                new EstadoUsuario { Id = 1, Nombre = "Activo" },
                new EstadoUsuario { Id = 2, Nombre = "Inactivo" }
            );

            // Insertar datos iniciales para Roles
            modelBuilder.Entity<RolUsuario>().HasData(
                new RolUsuario { Id = 1, Nombre = "Admin" },
                new RolUsuario { Id = 2, Nombre = "Vendedor" }
            );

            // Configurar las relaciones
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Estado)
                .WithMany(e => e.Usuarios)
                .HasForeignKey(u => u.EstadoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Rol)
                .WithMany(r => r.Usuarios)
                .HasForeignKey(u => u.RolId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
