using Microsoft.EntityFrameworkCore;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(int userId, string role)
    {
        var query = _context.TaskItems.AsQueryable();

        // If the user is not an Admin, restrict the query to only their tasks
        if (!role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.UserId == userId);
        }

        var metrics = new DashboardMetricsDto
        {
            CompletedTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskStatus.Completed),
            InProgressTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskStatus.InProgress),
            PendingTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskStatus.Pending)
        };

        return metrics;
    }

    public async Task<IEnumerable<TaskDto>> GetTasksAsync(int userId, string role)
    {
        var query = _context.TaskItems.AsQueryable();

        if (!role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.UserId == userId);
        }

        return await query.Select(t => new TaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            CreatedAt = t.CreatedAt,
            DueDate = t.DueDate,
            UserId = t.UserId
        }).ToListAsync();
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int taskId, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return null;

        if (!role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return null; // Unauthorized to view this task
        }

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            UserId = task.UserId
        };
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, int userId, string role)
    {
        int assignedUserId = userId;
        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && dto.AssignedToUserId.HasValue)
        {
            assignedUserId = dto.AssignedToUserId.Value;
        }

        var task = new Core.Entities.TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = Core.Enums.TaskStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            DueDate = dto.DueDate,
            UserId = assignedUserId
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            UserId = task.UserId
        };
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto dto, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return null;

        if (!role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return null; // Unauthorized to update this task
        }

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.DueDate = dto.DueDate;

        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && dto.AssignedToUserId.HasValue)
        {
            task.UserId = dto.AssignedToUserId.Value;
        }

        await _context.SaveChangesAsync();

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            UserId = task.UserId
        };
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return false;

        if (!role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return false; // Unauthorized to delete this task
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}
