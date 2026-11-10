using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportDesk.Api.Data;
using SupportDesk.Api.Models;

namespace SupportDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TicketsController(SupportDeskDbContext db) : ControllerBase
{
    private static readonly string[] Priorities = ["Low", "Normal", "High"];
    private static readonly string[] Statuses = ["Open", "In Progress", "Resolved"];

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Ticket>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await db.Tickets.OrderByDescending(ticket => ticket.CreatedAt).ToListAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Ticket>> GetById(int id, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create(Ticket ticket, CancellationToken cancellationToken)
    {
        if (!Priorities.Contains(ticket.Priority)) return BadRequest("Priority must be Low, Normal, or High.");
        if (!Statuses.Contains(ticket.Status)) return BadRequest("Status must be Open, In Progress, or Resolved.");

        ticket.Id = 0;
        ticket.CreatedAt = DateTime.UtcNow;
        db.Tickets.Add(ticket);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Ticket input, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        if (ticket is null) return NotFound();
        if (!Priorities.Contains(input.Priority)) return BadRequest("Priority must be Low, Normal, or High.");
        if (!Statuses.Contains(input.Status)) return BadRequest("Status must be Open, In Progress, or Resolved.");

        ticket.Title = input.Title;
        ticket.Description = input.Description;
        ticket.Requester = input.Requester;
        ticket.Priority = input.Priority;
        ticket.Status = input.Status;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        if (ticket is null) return NotFound();
        db.Tickets.Remove(ticket);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
