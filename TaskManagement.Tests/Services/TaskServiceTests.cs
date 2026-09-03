using Microsoft.EntityFrameworkCore;
using TaskManagement.Core.Entities;
using TaskManagement.Core.Enums;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Services;

namespace TaskManagement.Tests.Services;

public class TaskServiceTests
{
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        return new ApplicationDbContext(options);
    }

    // Dummy IEmailService for tests
    private class DummyEmailService : TaskManagement.Core.Interfaces.IEmailService
    {
        public System.Threading.Tasks.Task SendEmailAsync(string to, string subject, string body)
        {
            return System.Threading.Tasks.Task.CompletedTask;
        }
    }

    [Fact]
    public async System.Threading.Tasks.Task GetDashboardMetricsAsync_UserRole_ReturnsOnlyUserTasks()
    {
        // Arrange
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.AddRange(
            new TaskItem { UserId = 1, Status = Core.Enums.TaskItemStatus.Completed },
            new TaskItem { UserId = 1, Status = Core.Enums.TaskItemStatus.InProgress },
            new TaskItem { UserId = 2, Status = Core.Enums.TaskItemStatus.Pending } // Different user
        );
        await context.SaveChangesAsync();

        // Act
        var metrics = await service.GetDashboardMetricsAsync(1, "User");

        // Assert
        Assert.Equal(1, metrics.CompletedTaskCount);
        Assert.Equal(1, metrics.InProgressTaskCount);
        Assert.Equal(0, metrics.PendingTaskCount);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetDashboardMetricsAsync_AdminRole_ReturnsAllTasks()
    {
        // Arrange
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.AddRange(
            new TaskItem { UserId = 1, Status = Core.Enums.TaskItemStatus.Completed },
            new TaskItem { UserId = 1, Status = Core.Enums.TaskItemStatus.InProgress },
            new TaskItem { UserId = 2, Status = Core.Enums.TaskItemStatus.Pending } // Different user
        );
        await context.SaveChangesAsync();

        // Act
        var metrics = await service.GetDashboardMetricsAsync(1, "Admin");

        // Assert
        Assert.Equal(1, metrics.CompletedTaskCount);
        Assert.Equal(1, metrics.InProgressTaskCount);
        Assert.Equal(1, metrics.PendingTaskCount);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasksAsync_UserRole_ReturnsOnlyUserTasks()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.AddRange(
            new TaskItem { UserId = 1, Title = "User 1 Task" },
            new TaskItem { UserId = 2, Title = "User 2 Task" }
        );
        await context.SaveChangesAsync();

        var tasks = await service.GetTasksAsync(1, "User");

        Assert.Single(tasks);
        Assert.Equal("User 1 Task", tasks.First().Title);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTaskAsync_CreatesAndReturnsTask()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        var dto = new TaskManagement.Core.DTOs.CreateTaskDto { Title = "New Task", Description = "Desc" };
        var created = await service.CreateTaskAsync(dto, 1, "User");

        Assert.NotEqual(0, created.Id);
        Assert.Equal("New Task", created.Title);
        Assert.Equal(1, context.TaskItems.Count());
        Assert.Equal(1, created.UserId);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTaskAsync_AdminRole_CanAssignToOtherUser()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        var dto = new TaskManagement.Core.DTOs.CreateTaskDto { Title = "Assigned Task", AssignedToUserId = 2 };
        var created = await service.CreateTaskAsync(dto, 1, "Admin");

        Assert.Equal(2, created.UserId);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateTaskAsync_UserRole_UpdatesOwnTask()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.Add(new TaskItem { UserId = 1, Title = "Old Title" });
        await context.SaveChangesAsync();
        var taskId = context.TaskItems.First().Id;

        var dto = new TaskManagement.Core.DTOs.UpdateTaskDto { Title = "New Title", Status = TaskManagement.Core.Enums.TaskItemStatus.InProgress };
        var updated = await service.UpdateTaskAsync(taskId, dto, 1, "User");

        Assert.NotNull(updated);
        Assert.Equal("New Title", updated.Title);
        Assert.Equal(TaskManagement.Core.Enums.TaskItemStatus.InProgress, updated.Status);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateTaskAsync_UserRole_CannotUpdateOtherUserTask()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.Add(new TaskItem { UserId = 2, Title = "User 2 Task" });
        await context.SaveChangesAsync();
        var taskId = context.TaskItems.First().Id;

        var dto = new TaskManagement.Core.DTOs.UpdateTaskDto { Title = "Hacked Title" };
        var updated = await service.UpdateTaskAsync(taskId, dto, 1, "User");

        Assert.Null(updated);
        Assert.Equal("User 2 Task", context.TaskItems.First().Title);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteTaskAsync_AdminRole_CanDeleteAnyTask()
    {
        var context = GetDbContext();
        var emailService = new DummyEmailService();
        var service = new TaskService(context, emailService);

        context.TaskItems.Add(new TaskItem { UserId = 2, Title = "User 2 Task" });
        await context.SaveChangesAsync();
        var taskId = context.TaskItems.First().Id;

        var result = await service.DeleteTaskAsync(taskId, 1, "Admin");

        Assert.True(result);
        Assert.Empty(context.TaskItems);
    }
}
