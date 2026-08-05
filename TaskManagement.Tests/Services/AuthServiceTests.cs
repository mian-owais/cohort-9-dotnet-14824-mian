using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using TaskManagement.Core.Entities;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Services;

namespace TaskManagement.Tests.Services;

public class AuthServiceTests
{
    private readonly DbContextOptions<ApplicationDbContext> _dbContextOptions;
    private readonly Mock<IConfiguration> _configMock;

    public AuthServiceTests()
    {
        _dbContextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TaskManagementTestDb_" + Guid.NewGuid().ToString())
            .Options;

        _configMock = new Mock<IConfiguration>();
        
        var jwtSettingsMock = new Mock<IConfigurationSection>();
        jwtSettingsMock.Setup(x => x["Secret"]).Returns("ThisIsATestSecretKeyWhichIsAtLeast32Bytes!");
        jwtSettingsMock.Setup(x => x["Issuer"]).Returns("TestIssuer");
        jwtSettingsMock.Setup(x => x["Audience"]).Returns("TestAudience");

        _configMock.Setup(x => x.GetSection("JwtSettings")).Returns(jwtSettingsMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_NewUser_ReturnsJwtToken()
    {
        // Arrange
        using var context = new ApplicationDbContext(_dbContextOptions);
        var authService = new AuthService(context, _configMock.Object);

        var newUser = new User
        {
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var token = await authService.RegisterAsync(newUser, "StrongPass123!");

        // Assert
        Assert.False(string.IsNullOrEmpty(token));
        Assert.Equal(1, context.Users.Count());
    }

    [Fact]
    public async Task RegisterAsync_ExistingEmail_ThrowsException()
    {
        // Arrange
        using var context = new ApplicationDbContext(_dbContextOptions);
        var authService = new AuthService(context, _configMock.Object);

        var user1 = new User { Email = "duplicate@example.com" };
        await authService.RegisterAsync(user1, "Pass123!");

        var user2 = new User { Email = "duplicate@example.com" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => authService.RegisterAsync(user2, "Pass123!"));
        Assert.Equal("Email is already registered.", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsJwtToken()
    {
        // Arrange
        using var context = new ApplicationDbContext(_dbContextOptions);
        var authService = new AuthService(context, _configMock.Object);

        var user = new User { Email = "login@example.com" };
        await authService.RegisterAsync(user, "StrongPass123!");

        // Act
        var token = await authService.LoginAsync("login@example.com", "StrongPass123!");

        // Assert
        Assert.False(string.IsNullOrEmpty(token));
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsException()
    {
        // Arrange
        using var context = new ApplicationDbContext(_dbContextOptions);
        var authService = new AuthService(context, _configMock.Object);

        var user = new User { Email = "login@example.com" };
        await authService.RegisterAsync(user, "StrongPass123!");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => authService.LoginAsync("login@example.com", "WrongPass!"));
        Assert.Equal("Invalid email or password.", exception.Message);
    }
}
