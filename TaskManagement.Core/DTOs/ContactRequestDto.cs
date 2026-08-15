using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Core.DTOs
{
    public class ContactRequestDto
    {
        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
    }
}
