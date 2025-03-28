// Models/Proveedor.cs
namespace TiendaKeytlin.Server.Models
{
    public class Proveedor
    {
        public int Id { get; set; }
        public string Nombre { get; set; } // Cambiado de NombreEmpresa a Nombre
        public string NombreContacto { get; set; }
        public string Telefono { get; set; }
        public string TelefonoContacto { get; set; }
        public string Correo { get; set; } // Agregado para coincidir con frontend
        public string Estado { get; set; }
        public string? Direccion { get; set; } // Opcional
        public string? Descripcion { get; set; } // Opcional
    }
}
