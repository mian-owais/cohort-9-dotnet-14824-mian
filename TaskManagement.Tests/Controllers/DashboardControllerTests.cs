using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using TaskManagement.API.Controllers;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.Tests.Controllers;

public class DashboardControllerTests
{
    [Fact]
    public async System.Threading.Tasks.Task GetMetrics_ValidToken_ReturnsOkResultWithMetrics()
    {
        // Arrange
        var mockTaskService = new Mock<ITaskService>();
        var expectedMetrics = new DashboardMetricsDto { CompletedTaskCount = 5, InProgressTaskCount = 2, PendingTaskCount = 1 };
        mockTaskService.Setup(s => s.GetDashboardMetricsAsync(1, "User")).ReturnsAsync(expectedMetrics);

        var controller = new DashboardController(mockTaskService.Object);
        
        // Mock User Claims
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "User")
        }));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        // Act
        var result = await controller.GetMetrics();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<DashboardMetricsDto>(okResult.Value);
        Assert.Equal(5, returnValue.CompletedTaskCount);
    }
}
