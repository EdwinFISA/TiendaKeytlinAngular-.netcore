using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using TiendaKeytlin.Server.Data;
using TiendaKeytlin.Server.Models;

[Route("api/roles")]
[ApiController]
public class RolUsuarioController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolUsuarioController(AppDbContext context)
    {
        _context = context;
    }

    // Obtener todos los roles de usuario
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RolUsuario>>> GetRoles()
    {
        return await _context.Roles.ToListAsync();
    }

    // Obtener un rol por ID
    [HttpGet("{id}")]
    public async Task<ActionResult<RolUsuario>> GetRol(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol == null) return NotFound();
        return rol;
    }

    // Crear un nuevo rol
    [HttpPost]
    public async Task<ActionResult<RolUsuario>> PostRol(RolUsuario rol)
    {
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRol), new { id = rol.Id }, rol);
    }

    // Actualizar un rol
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRol(int id, RolUsuario rol)
    {
        if (id != rol.Id) return BadRequest();
        _context.Entry(rol).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Eliminar un rol
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol == null) return NotFound();
        _context.Roles.Remove(rol);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
