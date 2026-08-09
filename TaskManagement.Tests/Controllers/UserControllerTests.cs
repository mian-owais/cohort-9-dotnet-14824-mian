using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Interfaces;
using Xunit;

namespace TaskManagement.Tests.Controllers;

public class UserControllerTests
{
    [Fact]
    public async Task GetCurrentUser_ShouldReturnOk_WhenUserExists()
    {
        // Arrange
        var mockService = new Mock<IUserService>();
        mockService.Setup(s => s.GetUserByIdAsync(1))
            .ReturnsAsync(new UserDto { Id = 1, FirstName = "Test" });

        var controller = new UserController(mockService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        // Act
        var result = await controller.GetCurrentUser();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal(1, dto.Id);
        Assert.Equal("Test", dto.FirstName);
    }

    [Fact]
    public async Task GetCurrentUser_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        var mockService = new Mock<IUserService>();
        mockService.Setup(s => s.GetUserByIdAsync(999))
            .ReturnsAsync((UserDto?)null);

        var controller = new UserController(mockService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "999")
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        // Act
        var result = await controller.GetCurrentUser();

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }
}
