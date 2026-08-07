using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using TaskManagement.API.Controllers;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.Tests.Controllers;

public class TaskControllerTests
{
    private ClaimsPrincipal GetMockUser(string userId, string role)
    {
        return new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, role)
        }));
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasks_ReturnsOk_WithTasks()
    {
        var mockService = new Mock<ITaskService>();
        var tasks = new List<TaskDto> { new TaskDto { Id = 1, Title = "Test Task" } };
        mockService.Setup(s => s.GetTasksAsync(1, "User")).ReturnsAsync(tasks);

        var controller = new TaskController(mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = GetMockUser("1", "User") }
            }
        };

        var result = await controller.GetTasks();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsAssignableFrom<IEnumerable<TaskDto>>(okResult.Value);
        Assert.Single(returnValue);
    }
}
