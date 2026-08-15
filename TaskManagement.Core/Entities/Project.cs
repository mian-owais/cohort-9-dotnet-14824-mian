using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Core.Entities;

public class Project
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign Key for Creator
    public int CreatedByUserId { get; set; }
    public User Creator { get; set; } = null!;
    
    // Navigation
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
