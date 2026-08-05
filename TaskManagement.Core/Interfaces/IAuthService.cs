using TaskManagement.Core.Entities;

namespace TaskManagement.Core.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(User user, string password);
    Task<string> LoginAsync(string email, string password);
}
