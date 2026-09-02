using TaskManagement.Core.DTOs;

namespace TaskManagement.Core.Interfaces;

public interface ITaskService
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync(int userId, string role);
    Task<IEnumerable<UserDashboardMetricsDto>> GetAdminUserMetricsAsync();
    Task<IEnumerable<TaskDto>> GetTasksAsync(int userId, string role);
    Task<TaskDto?> GetTaskByIdAsync(int taskId, int userId, string role);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, int userId, string role);
    Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto dto, int userId, string role);
    Task<bool> DeleteTaskAsync(int taskId, int userId, string role);
}
