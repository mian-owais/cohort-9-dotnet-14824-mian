using System.ComponentModel.DataAnnotations;
using TaskManagement.Core.Enums;

namespace TaskManagement.Core.DTOs;

public class UpdateTaskDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Enums.TaskItemStatus Status { get; set; }

    public DateTime? DueDate { get; set; }
    
    public Enums.TaskPriority Priority { get; set; }

    public int? ProjectId { get; set; }
    
    public int? AssignedToUserId { get; set; }
}
