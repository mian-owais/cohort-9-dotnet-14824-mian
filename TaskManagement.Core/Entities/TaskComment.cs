using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Core.Entities;

public class TaskComment
{
    public int Id { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int TaskItemId { get; set; }
    public TaskItem TaskItem { get; set; } = null!;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
