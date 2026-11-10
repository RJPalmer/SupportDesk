using System.ComponentModel.DataAnnotations;

namespace SupportDesk.Api.Models;

public sealed class Ticket
{
    public int Id { get; set; }

    [Required, StringLength(120)]
    public string Title { get; set; } = "";

    [Required, StringLength(2000)]
    public string Description { get; set; } = "";

    [Required, StringLength(120)]
    public string Requester { get; set; } = "";

    [Required, StringLength(20)]
    public string Priority { get; set; } = "Normal";

    [Required, StringLength(20)]
    public string Status { get; set; } = "Open";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
