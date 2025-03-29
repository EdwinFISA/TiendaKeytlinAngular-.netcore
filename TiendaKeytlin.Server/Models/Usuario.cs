﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Text.Json.Serialization;


namespace TiendaKeytlin.Server.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public string Contrasena { get; set; }
        public string? Imagen { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? UltimoInicioSesion { get; set; }
        public int EstadoId { get; set; }
        public int RolId { get; set; }

        // Propiedades de navegación
        [JsonIgnore]
        [ForeignKey("EstadoId")]
        public virtual EstadoUsuario Estado { get; set; }

        [JsonIgnore]
        [ForeignKey("RolId")]
        public virtual RolUsuario Rol { get; set; }
    }
}