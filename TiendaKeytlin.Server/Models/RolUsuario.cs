using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TiendaKeytlin.Server.Models
{
    public class RolUsuario
    {
        public RolUsuario()
        {
            Usuarios = new HashSet<Usuario>();
        }

        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }

        public virtual ICollection<Usuario> Usuarios { get; set; }
    }
}