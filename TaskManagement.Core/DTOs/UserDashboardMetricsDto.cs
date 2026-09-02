namespace TaskManagement.Core.DTOs;

public class UserDashboardMetricsDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int CompletedTaskCount { get; set; }
    public int InProgressTaskCount { get; set; }
    public int PendingTaskCount { get; set; }
}
