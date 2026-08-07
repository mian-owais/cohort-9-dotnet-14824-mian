namespace TaskManagement.Core.DTOs;

public class DashboardMetricsDto
{
    public int CompletedTaskCount { get; set; }
    public int InProgressTaskCount { get; set; }
    public int PendingTaskCount { get; set; }
}
