using TaskManagement.Core.Enums;

namespace TaskManagement.Core.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Pending;
    public Enums.TaskPriority Priority { get; set; } = Enums.TaskPriority.Normal;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    
    // Foreign Key for Assignee
    public int? UserId { get; set; }
    public User? User { get; set; }

    // Foreign Key for Creator
    public int CreatedByUserId { get; set; }
    public User Creator { get; set; } = null!;

    // Foreign Key for Project
    public int? ProjectId { get; set; }
    public Project? Project { get; set; }

    // Navigation
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}
