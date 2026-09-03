using Microsoft.EntityFrameworkCore;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public TaskService(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(int userId, string role)
    {
        var query = _context.TaskItems.AsQueryable();

        // If the user is not an Admin, restrict the query to only their tasks
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.UserId == userId);
        }

        var metrics = new DashboardMetricsDto
        {
            CompletedTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskItemStatus.Completed),
            InProgressTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskItemStatus.InProgress),
            PendingTaskCount = await query.CountAsync(t => t.Status == Core.Enums.TaskItemStatus.Pending)
        };

        return metrics;
    }

    public async Task<IEnumerable<UserDashboardMetricsDto>> GetAdminUserMetricsAsync()
    {
        var users = await _context.Users.ToListAsync();
        var tasks = await _context.TaskItems.ToListAsync();
        
        var userMetrics = users.Select(u => new UserDashboardMetricsDto
        {
            UserId = u.Id,
            Name = $"{u.FirstName} {u.LastName}".Trim(),
            Email = u.Email,
            CompletedTaskCount = tasks.Count(t => t.UserId == u.Id && t.Status == Core.Enums.TaskItemStatus.Completed),
            InProgressTaskCount = tasks.Count(t => t.UserId == u.Id && t.Status == Core.Enums.TaskItemStatus.InProgress),
            PendingTaskCount = tasks.Count(t => t.UserId == u.Id && t.Status == Core.Enums.TaskItemStatus.Pending)
        }).ToList();
        
        return userMetrics;
    }

    public async Task<IEnumerable<TaskDto>> GetTasksAsync(int userId, string role)
    {
        var query = _context.TaskItems.AsQueryable();

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.UserId == userId);
        }

        return await query.Select(t => new TaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            DueDate = t.DueDate,
            ProjectId = t.ProjectId,
            UserId = t.UserId,
            CreatedByUserId = t.CreatedByUserId
        }).ToListAsync();
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int taskId, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return null;

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return null; // Unauthorized to view this task
        }

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            UserId = task.UserId,
            CreatedByUserId = task.CreatedByUserId
        };
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, int userId, string role)
    {
        int assignedUserId = userId;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && dto.AssignedToUserId.HasValue)
        {
            assignedUserId = dto.AssignedToUserId.Value;
        }

        var task = new Core.Entities.TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = Core.Enums.TaskItemStatus.Pending,
            Priority = dto.Priority,
            CreatedAt = DateTime.UtcNow,
            DueDate = dto.DueDate,
            ProjectId = dto.ProjectId,
            UserId = assignedUserId,
            CreatedByUserId = userId
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        // Email Notification Logic
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && assignedUserId != userId)
        {
            try
            {
                var assignedUser = await _context.Users.FindAsync(assignedUserId);
                if (assignedUser != null)
                {
                    var subject = "New Task Assigned: " + task.Title;
                    var body = $"Hello,\n\nYou have been assigned a new task by an administrator.\n\nTask: {task.Title}\nDescription: {task.Description}\nDue Date: {task.DueDate?.ToString("yyyy-MM-dd") ?? "None"}\n\nPlease log in to the Task Management System to view your tasks.";
                    await _emailService.SendEmailAsync(assignedUser.Email, subject, body);
                }
            }
            catch (Exception)
            {
                // Silently swallow email errors so task creation still succeeds even if SMTP is misconfigured
            }
        }

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            UserId = task.UserId,
            CreatedByUserId = task.CreatedByUserId
        };
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto dto, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return null;

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return null; // Unauthorized to update this task
        }

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.ProjectId = dto.ProjectId;
        task.UpdatedAt = DateTime.UtcNow;

        bool wasReassigned = false;
        var originalUserId = task.UserId;

        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && dto.AssignedToUserId.HasValue)
        {
            if (task.UserId != dto.AssignedToUserId.Value)
            {
                wasReassigned = true;
            }
            task.UserId = dto.AssignedToUserId.Value;
        }

        await _context.SaveChangesAsync();

        // Email Notification Logic for Reassignment
        if (wasReassigned)
        {
            try
            {
                var assignedUser = await _context.Users.FindAsync(task.UserId);
                if (assignedUser != null)
                {
                    var subject = "Task Re-Assigned To You: " + task.Title;
                    var body = $"Hello,\n\nAn existing task has just been re-assigned to you by an administrator.\n\nTask: {task.Title}\nDescription: {task.Description}\nDue Date: {task.DueDate?.ToString("yyyy-MM-dd") ?? "None"}\n\nPlease log in to the Task Management System to view your tasks.";
                    await _emailService.SendEmailAsync(assignedUser.Email, subject, body);
                }
            }
            catch (Exception)
            {
                // Silently swallow email errors so task update still succeeds even if SMTP is misconfigured
            }
        }

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            UserId = task.UserId,
            CreatedByUserId = task.CreatedByUserId
        };
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int userId, string role)
    {
        var task = await _context.TaskItems.FindAsync(taskId);
        if (task == null) return false;

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && task.UserId != userId)
        {
            return false; // Unauthorized to delete this task
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}
