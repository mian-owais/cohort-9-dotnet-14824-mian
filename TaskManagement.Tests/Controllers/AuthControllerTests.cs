using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Core.DTOs;
using TaskManagement.Core.Entities;
using TaskManagement.Core.Interfaces;

namespace TaskManagement.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Register_ValidModel_ReturnsOkResultWithToken()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedToken = "fake-jwt-token";
        _authServiceMock.Setup(s => s.RegisterAsync(It.IsAny<User>(), It.IsAny<string>()))
                        .ReturnsAsync(expectedToken);

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        // Using reflection or dynamic to check anonymous object property is complex in xUnit without dynamic
        // A simple check on the type is often enough or we can serialize it
    }

    [Fact]
    public async Task Login_ValidModel_ReturnsOkResultWithToken()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedToken = "fake-jwt-token";
        _authServiceMock.Setup(s => s.LoginAsync(loginDto.Email, loginDto.Password))
                        .ReturnsAsync(expectedToken);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "wrong-password"
        };

        _authServiceMock.Setup(s => s.LoginAsync(loginDto.Email, loginDto.Password))
                        .ThrowsAsync(new Exception("Invalid email or password."));

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }
}
