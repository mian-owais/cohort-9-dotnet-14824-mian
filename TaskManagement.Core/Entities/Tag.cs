using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Core.Entities;

public class Tag
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(7)]
    public string? ColorCode { get; set; } // e.g. "#FF5733"
    
    public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}
