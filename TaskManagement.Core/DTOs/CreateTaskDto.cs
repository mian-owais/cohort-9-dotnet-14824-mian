using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Core.DTOs;

public class CreateTaskDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }
    
    public Enums.TaskPriority Priority { get; set; } = Enums.TaskPriority.Normal;

    public string Category { get; set; } = "General";

    public int? ProjectId { get; set; }
    
    public int? AssignedToUserId { get; set; }
}
