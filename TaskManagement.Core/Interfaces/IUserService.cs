using TaskManagement.Core.DTOs;

namespace TaskManagement.Core.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
}
